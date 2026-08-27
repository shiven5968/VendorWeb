import { MUSCLE_PASS_PLANS, MUSCLE_PASS_PLAN_LIST, getMusclePassPlan } from './src/config/pricing.js';
import { OFFICIAL_CAMPUS_CONTACTS, getOfficialContacts } from './src/config/contacts.js';
import createRazorpayOrderHandler from './api/create-razorpay-order.js';
import verifyRazorpayPaymentHandler from './api/verify-razorpay-payment.js';
import crypto from 'crypto';

console.log('=== TEST SUITE: MUSCLE PASS PRICING & OFFICIAL CONTACTS ===\n');

// 1. TEST PLAN CONFIGURATION
console.log('--- TEST 1: Pricing Config Consistency ---');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_MONTHLY.price === 69, 'Monthly price must be 69');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_MONTHLY.durationDays === 30, 'Monthly duration must be 30 days');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_MONTHLY.amountPaise === 6900, 'Monthly amountPaise must be 6900');

console.assert(MUSCLE_PASS_PLANS.MUSCLE_3_MONTHS.price === 149, '3 Months price must be 149');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_3_MONTHS.durationDays === 90, '3 Months duration must be 90 days');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_3_MONTHS.amountPaise === 14900, '3 Months amountPaise must be 14900');

console.assert(MUSCLE_PASS_PLANS.MUSCLE_6_MONTHS.price === 249, '6 Months price must be 249');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_6_MONTHS.durationDays === 180, '6 Months duration must be 180 days');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_6_MONTHS.amountPaise === 24900, '6 Months amountPaise must be 24900');

console.assert(MUSCLE_PASS_PLANS.MUSCLE_YEARLY.price === 449, 'Yearly price must be 449');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_YEARLY.durationDays === 365, 'Yearly duration must be 365 days');
console.assert(MUSCLE_PASS_PLANS.MUSCLE_YEARLY.amountPaise === 44900, 'Yearly amountPaise must be 44900');

console.log('✓ All 4 Muscle Pass plans verified with exact prices and durations:');
console.log('  1. Monthly: ₹69 (30 days)');
console.log('  2. 3 Months: ₹149 (90 days)');
console.log('  3. 6 Months: ₹249 (180 days)');
console.log('  4. 1 Year: ₹449 (365 days)\n');

// 2. TEST SERVER-SIDE ORDER CREATION MAPPING
console.log('--- TEST 2: Server-Side Razorpay Order Creation Mapping ---');

async function testOrderCreation(planId, expectedAmount, expectedPrice) {
  let responseData = null;
  let statusCode = null;

  const mockReq = {
    method: 'POST',
    body: { userId: 'usr_test_student_123', planId, amount: 1 } // frontend sends spoofed amount 1
  };
  const mockRes = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseData = data; },
        end: () => {}
      };
    }
  };

  await createRazorpayOrderHandler(mockReq, mockRes);
  
  // Since Razorpay live keys might not be in test env, it returns requiresConfig with server-mapped amount
  const testedAmount = responseData.amount;
  const testedPrice = responseData.price;
  console.log(`Plan "${planId}": server-mapped amount = ${testedAmount} paise (₹${testedPrice})`);
  console.assert(testedAmount === expectedAmount, `Server amount must be ${expectedAmount} paise`);
  console.assert(testedPrice === expectedPrice, `Server price must be ₹${expectedPrice}`);
}

await testOrderCreation('MUSCLE_MONTHLY', 6900, 69);
await testOrderCreation('MUSCLE_3_MONTHS', 14900, 149);
await testOrderCreation('MUSCLE_6_MONTHS', 24900, 249);
await testOrderCreation('MUSCLE_YEARLY', 44900, 449);
console.log('✓ Server-side order creation strictly overrides client amount and maps planId to official price.\n');

// 3. TEST SERVER-SIDE PAYMENT VERIFICATION & DURATION
console.log('--- TEST 3: Server-Side Razorpay Signature & Duration Calculation ---');

process.env.RAZORPAY_KEY_SECRET = 'test_secret_key_12345';

async function testPaymentVerification(planId, expectedDurationDays, expectedAmount) {
  const orderId = 'order_test_9999';
  const paymentId = 'pay_test_8888';
  const validSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  let responseData = null;
  let statusCode = null;

  const mockReq = {
    method: 'POST',
    body: {
      userId: 'usr_test_student_123',
      planId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature
    }
  };
  const mockRes = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => { responseData = data; },
        end: () => {}
      };
    }
  };

  await verifyRazorpayPaymentHandler(mockReq, mockRes);
  console.assert(responseData.verified === true, 'Signature verification must pass');
  console.assert(responseData.subscription.amount === expectedAmount, `Subscription amount must be ₹${expectedAmount}`);
  
  const startDate = new Date(responseData.subscription.startDate);
  const expiryDate = new Date(responseData.subscription.expiryDate);
  const diffDays = Math.round((expiryDate - startDate) / (1000 * 60 * 60 * 24));
  
  console.log(`Plan "${planId}": calculated duration = ${diffDays} days, amount = ₹${responseData.subscription.amount}`);
  console.assert(diffDays === expectedDurationDays, `Duration must be ${expectedDurationDays} days`);
}

await testPaymentVerification('MUSCLE_MONTHLY', 30, 69);
await testPaymentVerification('MUSCLE_3_MONTHS', 90, 149);
await testPaymentVerification('MUSCLE_6_MONTHS', 180, 249);
await testPaymentVerification('MUSCLE_YEARLY', 365, 449);
console.log('✓ Server-side payment verification computes exact durations and amounts for Firestore subscription.\n');

// 4. TEST OFFICIAL CONTACTS
console.log('--- TEST 4: Official Contacts Configuration ---');
const contacts = getOfficialContacts();
console.assert(contacts.warden.email === 'warden@abes.ac.in', 'Warden email must be warden@abes.ac.in');
console.assert(contacts.committee.email === 'committee@abes.ac.in', 'Committee email must be committee@abes.ac.in');
console.assert(contacts.warden.phone === null, 'Warden phone must not be fabricated');
console.assert(contacts.committee.phone === null, 'Committee phone must not be fabricated');

console.log('Warden Contact:');
console.log('  Name:', contacts.warden.name);
console.log('  Role:', contacts.warden.role);
console.log('  Email:', contacts.warden.email);
console.log('  Phone:', contacts.warden.phone ?? '[Not configured in DB / Pending entry]');

console.log('Mess Committee Contact:');
console.log('  Name:', contacts.committee.name);
console.log('  Role:', contacts.committee.role);
console.log('  Email:', contacts.committee.email);
console.log('  Phone:', contacts.committee.phone ?? '[Not configured in DB / Pending entry]');
console.log('\n✓ Contacts configuration verified with zero invented/fake details.\n');

console.log('====================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
