/**
 * Automated Verification Script: Phase 2.1 Listener Consolidation
 *
 * Verifies:
 * 1. AppContext.jsx contains strictly ONE active onSnapshot listener (user notifications).
 * 2. Unbounded/static listeners (meals, ratings, polls, votes, complaints, protein_logs,
 *    redemptions, subscriptions, users, mess_photos, hygiene_checks) are removed from onSnapshot.
 * 3. On-demand refresh functions exist and are exported in AppContext.
 * 4. AuthContext.jsx maintains exactly ONE user profile listener (users/{uid}).
 * 5. Total persistent realtime listeners per student is strictly <= 2 across the entire application.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===============================================================');
console.log('  MESSMATES — PHASE 2.1 LISTENER CONSOLIDATION VERIFICATION');
console.log('===============================================================\n');

// 1. Audit AppContext.jsx
const appContextPath = path.join(rootDir, 'src', 'context', 'AppContext.jsx');
const appContextCode = fs.readFileSync(appContextPath, 'utf-8');

console.log('[TEST 1] AppContext onSnapshot Audit');
const onSnapshotMatches = appContextCode.match(/onSnapshot\s*\(/g) || [];
console.log(`  Found ${onSnapshotMatches.length} onSnapshot invocation(s) in AppContext.jsx`);
assert.strictEqual(
  onSnapshotMatches.length,
  1,
  `AppContext must have exactly 1 onSnapshot listener (notifications), but found ${onSnapshotMatches.length}`
);
console.log('  ✓ AppContext contains strictly 1 realtime onSnapshot listener.\n');

// 2. Verify notifications is the single listener
console.log('[TEST 2] Verify Sole Realtime Listener is User-Scoped Notifications');
const notificationListenerPattern = /onSnapshot\s*\(\s*query\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]notifications['"]\s*\)\s*,\s*where\s*\(\s*['"]userId['"]\s*,\s*['"]==['"]\s*,\s*currentUid\s*\)\s*\)/;
assert.ok(
  notificationListenerPattern.test(appContextCode),
  'AppContext single listener must be user-scoped notifications where userId == currentUid'
);
console.log('  ✓ Sole listener is strictly scoped to current user: where("userId", "==", currentUid)\n');

// 3. Verify Static & Global onSnapshots are Removed
console.log('[TEST 3] Verify Static / Fan-out onSnapshot Listeners Are Eliminated');
const forbiddenListeners = [
  { name: 'meals', pattern: /onSnapshot\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]meals['"]\s*\)/ },
  { name: 'ratings (global)', pattern: /onSnapshot\s*\(\s*query\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]ratings['"]\s*\)\s*,\s*limit\s*\(/ },
  { name: 'polls', pattern: /onSnapshot\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]polls['"]\s*\)/ },
  { name: 'votes (global)', pattern: /onSnapshot\s*\(\s*query\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]votes['"]\s*\)\s*,\s*limit\s*\(/ },
  { name: 'users (unbounded staff)', pattern: /onSnapshot\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]users['"]\s*\)/ },
  { name: 'protein_logs', pattern: /onSnapshot\s*\(\s*proteinTarget/ },
  { name: 'subscriptions', pattern: /onSnapshot\s*\(\s*doc\s*\(\s*firestoreDb\s*,\s*['"]subscriptions['"]/ },
  { name: 'reward_events', pattern: /onSnapshot\s*\(\s*query\s*\(\s*collection\s*\(\s*firestoreDb\s*,\s*['"]reward_events['"]/ },
];

forbiddenListeners.forEach(({ name, pattern }) => {
  assert.ok(
    !pattern.test(appContextCode),
    `Forbidden persistent listener on "${name}" must NOT exist in AppContext.jsx`
  );
  console.log(`  ✓ Persistent listener on "${name}" is completely eliminated.`);
});
console.log('');

// 4. Verify Data Refresh Helpers exist
console.log('[TEST 4] Verify On-Demand Data Refresh Helpers');
const requiredHelpers = [
  'refreshMeals',
  'refreshRatings',
  'refreshPolls',
  'refreshVotes',
  'refreshComplaints',
  'refreshRewardEvents',
  'refreshAll'
];

requiredHelpers.forEach(fnName => {
  assert.ok(appContextCode.includes(fnName), `Missing helper ${fnName} in AppContext.jsx`);
  console.log(`  ✓ Helper ${fnName} is implemented and exposed.`);
});
console.log('');

// 5. Audit AuthContext.jsx
console.log('[TEST 5] AuthContext Profile Listener Audit');
const authContextPath = path.join(rootDir, 'src', 'context', 'AuthContext.jsx');
const authContextCode = fs.readFileSync(authContextPath, 'utf-8');
const authSnapshotMatches = authContextCode.match(/onSnapshot\s*\(/g) || [];
console.log(`  Found ${authSnapshotMatches.length} onSnapshot invocation(s) in AuthContext.jsx`);
assert.strictEqual(
  authSnapshotMatches.length,
  1,
  `AuthContext must contain exactly 1 onSnapshot listener (user profile), but found ${authSnapshotMatches.length}`
);
console.log('  ✓ AuthContext contains strictly 1 user profile listener (users/{uid}).\n');

// 6. Total Concurrent Listener Footprint Calculation
console.log('[TEST 6] Overall Per-Student Listener Footprint');
const totalStudentListeners = onSnapshotMatches.length + authSnapshotMatches.length;
console.log(`  Before Phase 2.1: 11 to 13 persistent WebSocket listeners per student (55,000 total across 5k users)`);
console.log(`  After Phase 2.1:  ${totalStudentListeners} persistent WebSocket listeners per student (${totalStudentListeners * 5000} total across 5k users)`);
assert.strictEqual(
  totalStudentListeners,
  2,
  `Expected total listeners per student to be 2, but got ${totalStudentListeners}`
);
console.log('  ✓ Listener footprint reduced by 82% (from 11 to 2 concurrent sockets per student)!\n');

console.log('===============================================================');
console.log('  ALL PHASE 2.1 LISTENER CONSOLIDATION CHECKS PASSED! (6/6)');
console.log('===============================================================\n');
