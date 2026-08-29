const SERVER_PLANS = {
  MUSCLE_MONTHLY: { id: 'MUSCLE_MONTHLY', amountPaise: 6900, price: 69, name: 'Muscle Pass 1 Month' },
  MUSCLE_3_MONTHS: { id: 'MUSCLE_3_MONTHS', amountPaise: 14900, price: 149, name: 'Muscle Pass 3 Months' },
  MUSCLE_6_MONTHS: { id: 'MUSCLE_6_MONTHS', amountPaise: 24900, price: 249, name: 'Muscle Pass 6 Months' },
  MUSCLE_YEARLY: { id: 'MUSCLE_YEARLY', amountPaise: 44900, price: 449, name: 'Muscle Pass 1 Year' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const { userId, planId = 'MUSCLE_MONTHLY' } = body || {};

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to create a subscription order.' });
    }

    // SERVER-SIDE PLAN LOOKUP: Never trust frontend-supplied amount
    const selectedPlan = SERVER_PLANS[planId];
    if (!selectedPlan) {
      return res.status(400).json({ 
        message: `Invalid subscription plan "${planId}". Valid plans: MUSCLE_MONTHLY, MUSCLE_3_MONTHS, MUSCLE_6_MONTHS, MUSCLE_YEARLY.` 
      });
    }

    const serverAmountPaise = selectedPlan.amountPaise;
    const currency = 'INR';

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        message: 'Payment Gateway Configuration Required: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not configured on the server.',
        requiresConfig: true,
        planId: selectedPlan.id,
        amount: serverAmountPaise,
        price: selectedPlan.price
      });
    }

    // Call official Razorpay Orders API with server-verified amount
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: serverAmountPaise, // strictly enforced server-side
        currency,
        receipt: `rcpt_mp_${userId.substring(0, 8)}_${Date.now()}`,
        notes: {
          userId,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          priceINR: selectedPlan.price,
          service: 'MessMates Muscle Pass'
        }
      })
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      return res.status(orderResponse.status).json({
        message: orderData.error?.description || 'Failed to create Razorpay payment order.'
      });
    }

    return res.status(200).json({
      success: true,
      orderId: orderData.id,
      amount: orderData.amount,
      price: selectedPlan.price,
      currency: orderData.currency,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      keyId
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    return res.status(500).json({ message: err.message || 'Internal payment error.' });
  }
}
