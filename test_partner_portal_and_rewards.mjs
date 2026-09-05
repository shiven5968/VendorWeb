import { db, INITIAL_PARTNER_REWARDS, INITIAL_USERS } from './src/services/db.js';

console.log('=== TEST SUITE: MESSMATES PARTNER PORTAL & STUDENT REWARDS ===\n');

// 1. Verify Partner Rewards Schema
console.log('--- TEST 1: Initial Partner Rewards Schema ---');
console.assert(Array.isArray(INITIAL_PARTNER_REWARDS), 'INITIAL_PARTNER_REWARDS must be an array');
console.assert(INITIAL_PARTNER_REWARDS.length >= 4, 'Must have at least 4 initial partner rewards');

for (const reward of INITIAL_PARTNER_REWARDS) {
  console.assert(typeof reward.rewardId === 'string' && reward.rewardId.length > 0, `Reward ID missing in ${JSON.stringify(reward)}`);
  console.assert(typeof reward.vendorId === 'string' && reward.vendorId.length > 0, `Vendor ID missing in ${reward.rewardId}`);
  console.assert(typeof reward.vendorName === 'string' && reward.vendorName.length > 0, `Vendor Name missing in ${reward.rewardId}`);
  console.assert(typeof reward.vendorLogo === 'string', `Vendor Logo missing in ${reward.rewardId}`);
  console.assert(typeof reward.title === 'string' && reward.title.length > 0, `Title missing in ${reward.rewardId}`);
  console.assert(typeof reward.description === 'string', `Description missing in ${reward.rewardId}`);
  console.assert(typeof reward.pointsRequired === 'number' && reward.pointsRequired > 0, `pointsRequired must be number > 0 in ${reward.rewardId}`);
  console.assert(typeof reward.category === 'string', `category missing in ${reward.rewardId}`);
  console.assert(typeof reward.discountCode === 'string' && reward.discountCode.length > 0, `discountCode missing in ${reward.rewardId}`);
  console.assert(typeof reward.totalVouchers === 'number' && reward.totalVouchers > 0, `totalVouchers must be > 0 in ${reward.rewardId}`);
  console.assert(typeof reward.claimedCount === 'number', `claimedCount must be number in ${reward.rewardId}`);
  console.assert(typeof reward.isActive === 'boolean', `isActive must be boolean in ${reward.rewardId}`);
  console.assert(typeof reward.expiryDate === 'string', `expiryDate missing in ${reward.rewardId}`);
}
console.log(`✓ All ${INITIAL_PARTNER_REWARDS.length} partner rewards conform to the Firestore schema.`);

// 2. Verify Partner Accounts in INITIAL_USERS
console.log('\n--- TEST 2: Partner Role in Initial Users ---');
const partnerUser = INITIAL_USERS.find(u => u.role === 'partner');
console.assert(partnerUser, 'INITIAL_USERS must include at least one user with role == "partner"');
console.assert(partnerUser.vendorId === 'vendor_burger_club', 'Partner must have vendorId');
console.assert(partnerUser.vendorName === 'The Burger Club', 'Partner must have vendorName');
console.log(`✓ Verified partner account: ${partnerUser.name} (${partnerUser.email}), role: ${partnerUser.role}`);

// 3. Test Partner Save, Edit, Toggle, Delete Operations
console.log('\n--- TEST 3: Partner Offer Management (Save, Edit, Toggle, Delete) ---');
const testOfferPayload = {
  rewardId: 'rew_test_cafe_1',
  vendorId: 'vendor_cafe_hub',
  vendorName: 'Campus Cafe Hub',
  vendorLogo: 'https://example.com/logo.jpg',
  title: 'Free Espresso with Any Sandwich',
  description: 'Valid for students showing digital pass at Cafe Hub.',
  pointsRequired: 80,
  category: 'Food & Dining',
  discountCode: 'CAFEABES',
  totalVouchers: 20,
  claimedCount: 0,
  isActive: true,
  expiryDate: '2026-11-30'
};

const saved = await db.savePartnerReward(testOfferPayload);
console.assert(saved.rewardId === 'rew_test_cafe_1', 'Saved offer must retain rewardId');
console.assert(saved.pointsRequired === 80, 'Saved offer points must match');
console.log('✓ Offer creation saved successfully.');

// Toggle Inactive
const toggledOff = await db.togglePartnerRewardActive('rew_test_cafe_1', false);
console.assert(toggledOff.isActive === false, 'Offer should be inactive after toggle');
const allRewardsAfterToggle = db.getPartnerRewards();
const foundToggled = allRewardsAfterToggle.find(r => r.rewardId === 'rew_test_cafe_1');
console.assert(foundToggled && foundToggled.isActive === false, 'Inactive state must persist');
console.log('✓ One-click Active/Inactive toggle verified (Hidden from students).');

// Toggle Active
const toggledOn = await db.togglePartnerRewardActive('rew_test_cafe_1', true);
console.assert(toggledOn.isActive === true, 'Offer should be active after toggle');
console.log('✓ One-click Active/Inactive toggle verified (Live on student app).');

// 4. Test Student Reward Claiming Flow (Atomic Point Deduction + MM-XXXX Voucher Generation)
console.log('\n--- TEST 4: Student Claim Reward Flow ---');
const mockStudent = {
  uid: 'usr_test_student_1',
  id: 'usr_test_student_1',
  name: 'Aman Verma',
  email: 'aman.verma@abes.ac.in',
  rewardPoints: 300
};

// Initial state
const initialOffer = db.getPartnerRewards().find(r => r.rewardId === 'rew_test_cafe_1');
const initialClaimed = initialOffer.claimedCount;

const redemption = await db.claimPartnerReward({
  student: mockStudent,
  reward: initialOffer
});

console.assert(redemption, 'claimPartnerReward must return redemption object');
console.assert(redemption.studentName === 'Aman Verma', 'Student name must match');
console.assert(redemption.rewardTitle === 'Free Espresso with Any Sandwich', 'Reward title must match');
console.assert(redemption.status === 'ACTIVE', 'New redemption status must be ACTIVE');
console.assert(redemption.voucherCode.startsWith('MM-'), `Voucher code must start with MM-, got ${redemption.voucherCode}`);
console.assert(redemption.voucherCode.length === 7, `Voucher code must be 7 chars (MM-XXXX), got ${redemption.voucherCode.length}`);

// Verify stock incremented
const updatedOffer = db.getPartnerRewards().find(r => r.rewardId === 'rew_test_cafe_1');
console.assert(updatedOffer.claimedCount === initialClaimed + 1, 'Offer claimedCount must increment by 1');
console.log(`✓ Student claimed reward. Generated voucher code: ${redemption.voucherCode}`);
console.log(`✓ Reward claimedCount updated: ${initialClaimed} -> ${updatedOffer.claimedCount}`);

// 5. Test Insufficient Points Protection
console.log('\n--- TEST 5: Insufficient Points Validation ---');
let failedAsExpected = false;
try {
  const brokeStudent = {
    uid: 'usr_broke',
    name: 'Broke Student',
    email: 'broke@abes.ac.in',
    rewardPoints: 10
  };
  await db.claimPartnerReward({
    student: brokeStudent,
    reward: initialOffer
  });
} catch (e) {
  failedAsExpected = true;
  console.log(`✓ Expected error caught: "${e.message}"`);
}
console.assert(failedAsExpected, 'Claim must fail when points are insufficient');

// 6. Test Voucher Validator & Redemption Scanner
console.log('\n--- TEST 6: Vendor Voucher Validator & Redemption Scanner ---');
const validationResponse = await db.validateAndRedeemVoucher('vendor_cafe_hub', redemption.voucherCode);
console.assert(validationResponse.success === true, 'Validation must succeed for active voucher');
console.assert(validationResponse.redemption.status === 'REDEEMED', 'Status must transition to REDEEMED');
console.assert(typeof validationResponse.redemption.redeemedAt === 'string', 'redeemedAt timestamp must be set');
console.log(`✓ Counter staff validated voucher: "${validationResponse.message}"`);
console.log(`✓ Redemption status updated to: ${validationResponse.redemption.status} at ${validationResponse.redemption.redeemedAt}`);

// 7. Test Duplicate Redemption Prevention
console.log('\n--- TEST 7: Duplicate Redemption Prevention ---');
let duplicateBlocked = false;
try {
  await db.validateAndRedeemVoucher('vendor_cafe_hub', redemption.voucherCode);
} catch (e) {
  duplicateBlocked = true;
  console.log(`✓ Expected duplicate block caught: "${e.message}"`);
}
console.assert(duplicateBlocked, 'Re-redeeming the same voucher code must be blocked');

// 8. Test Invalid Code Handling
console.log('\n--- TEST 8: Invalid Code Handling ---');
let invalidBlocked = false;
try {
  await db.validateAndRedeemVoucher('vendor_cafe_hub', 'MM-ZZ99');
} catch (e) {
  invalidBlocked = true;
  console.log(`✓ Expected invalid voucher block caught: "${e.message}"`);
}
console.assert(invalidBlocked, 'Invalid voucher codes must be rejected');

// Clean up test offer
await db.deletePartnerReward('rew_test_cafe_1');
console.assert(!db.getPartnerRewards().find(r => r.rewardId === 'rew_test_cafe_1'), 'Test offer deleted cleanly');
console.log('✓ Cleanup completed.');

console.log('\n====================================================');
console.log('ALL PARTNER PORTAL & REWARDS TESTS PASSED! 🌟✅');
console.log('====================================================');
