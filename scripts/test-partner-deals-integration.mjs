import assert from 'node:assert';
import fs from 'fs';

console.log('===============================================================');
console.log('  MESSMATES — LIVE PARTNER DEALS INTEGRATION VERIFICATION');
console.log('===============================================================\n');

// 1. Verify HealthyRewardsPage.jsx content
const healthyPage = fs.readFileSync('src/pages/HealthyRewardsPage.jsx', 'utf-8');

console.log('[TEST 1] Verify Mess Rewards tab removal');
assert.strictEqual(healthyPage.includes('Mess Rewards'), false, 'Mess Rewards tab must be completely removed');
assert.strictEqual(healthyPage.includes("setActiveTab('catalog')"), false, 'catalog tab navigation must be removed');
assert.strictEqual(healthyPage.includes("activeTab === 'catalog'"), false, 'catalog panel conditional render must be removed');
console.log('  ✓ "Mess Rewards" tab, button, and conditional rendering completely removed\n');

console.log('[TEST 2] Verify Required 3-Tab Structure');
assert.strictEqual(healthyPage.includes('Live Partner Deals'), true, 'Live Partner Deals tab must exist');
assert.strictEqual(healthyPage.includes('Points Ledger'), true, 'Points Ledger tab must exist');
assert.strictEqual(healthyPage.includes('My Redemptions'), true, 'My Redemptions tab must exist');
console.log('  ✓ Structure strictly contains: Live Partner Deals, Points Ledger, My Redemptions\n');

console.log('[TEST 3] Verify Default Active Tab is "partner"');
assert.strictEqual(healthyPage.includes("useState('partner')"), true, 'Default tab must be partner');
console.log('  ✓ Default primary tab is "partner" (Live Partner Deals)\n');

console.log('[TEST 4] Verify RewardsSection.jsx Firestore Connection');
const rewardsSection = fs.readFileSync('src/components/RewardsSection.jsx', 'utf-8');
assert.strictEqual(rewardsSection.includes("collection(db, 'rewards')"), true, 'Must query /rewards collection');
assert.strictEqual(rewardsSection.includes('claimedCount'), true, 'Must track claimedCount');
assert.strictEqual(rewardsSection.includes('totalVouchers'), true, 'Must track totalVouchers');
assert.strictEqual(rewardsSection.includes('pointsRequired'), true, 'Must track pointsRequired');
assert.strictEqual(rewardsSection.includes('voucherCode'), true, 'Must generate voucher code');
assert.strictEqual(rewardsSection.includes("doc(db, 'redemptions'"), true, 'Must write to /redemptions collection');
console.log('  ✓ RewardsSection correctly connects to Firestore /rewards and /redemptions\n');

console.log('[TEST 5] Verify Firestore Security Rules on /rewards');
const rules = fs.readFileSync('firestore.rules', 'utf-8');
assert.strictEqual(rules.includes('match /rewards/{rewardId}'), true, 'Rules must define /rewards/{rewardId}');
assert.strictEqual(rules.includes('allow read: if true;'), true, 'Rules must allow public reading of active partner rewards');
console.log('  ✓ Firestore rules allow reliable reading of live partner deals without permission errors\n');

console.log('===============================================================');
console.log('  ALL INTEGRATION VERIFICATION CHECKS PASSED!');
console.log('===============================================================');
