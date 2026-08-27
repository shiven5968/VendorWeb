/**
 * Client Razorpay Payment Service for Muscle Pass
 */

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateMusclePassPayment = async ({
  userId,
  userName,
  userEmail,
  planId = 'muscle_pass_monthly',
  onSuccess,
  onError
}) => {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error('Unable to connect to Razorpay Payment Gateway. Please check your network.');
    }

    // 1. Create Order Server-Side
    const metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    const orderApiUrl = metaEnv.VITE_RAZORPAY_ORDER_URL || '/api/create-razorpay-order';

    const orderRes = await fetch(orderApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        planId,
        amount: 29900, // ₹299.00
        currency: 'INR'
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.message || 'Unable to initiate payment.');
    }

    // 2. Open Razorpay Checkout Modal
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MessMates',
      description: 'Muscle Pass - 1 Month High-Protein Access',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
      order_id: orderData.orderId,
      prefill: {
        name: userName || 'Student',
        email: userEmail || 'student@abes.ac.in'
      },
      theme: {
        color: '#059669' // Emerald
      },
      handler: async (response) => {
        try {
          // 3. Verify Payment Server-Side
          const verifyApiUrl = metaEnv.VITE_RAZORPAY_VERIFY_URL || '/api/verify-razorpay-payment';
          const verifyRes = await fetch(verifyApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              planId
            })
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.verified) {
            throw new Error(verifyData.message || 'Payment signature verification failed.');
          }

          if (onSuccess) onSuccess(verifyData);
        } catch (verifyErr) {
          console.error('[Payment Verification Error]:', verifyErr);
          if (onError) onError(verifyErr.message || 'Verification failed.');
        }
      },
      modal: {
        ondismiss: () => {
          if (onError) onError('Payment cancelled by user.');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('[Payment Init Error]:', err);
    if (onError) onError(err.message);
  }
};
