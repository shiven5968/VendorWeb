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

    const { userId, planId = 'muscle_pass_monthly', amount = 29900, currency = 'INR' } = body || {};

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to create a subscription order.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({
        message: 'Payment Gateway Configuration Required: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are not yet configured in server environment variables.',
        requiresConfig: true
      });
    }

    // Call official Razorpay Orders API
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Number(amount), // in paise (e.g. 29900 = ₹299)
        currency,
        receipt: `rcpt_mp_${userId.substring(0, 10)}_${Date.now()}`,
        notes: {
          userId,
          planId,
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
      currency: orderData.currency,
      keyId
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    return res.status(500).json({ message: err.message || 'Internal payment error.' });
  }
}
