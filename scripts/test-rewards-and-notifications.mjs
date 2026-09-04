/**
 * Automated Verification Script: MessMates Real Rewards & Notification Engine
 *
 * Verifies:
 * 1. Daily login reward: exactly +2 points once per student per calendar day in Asia/Kolkata.
 * 2. Duplicate same-day login: 0 points awarded (idempotent).
 * 3. Next calendar day login: +2 points awarded again.
 * 4. Meal rating reward: exactly +1 point per submitted meal occurrence.
 * 5. Duplicate same-occurrence rating: 0 points awarded.
 * 6. Same recurring dish next week: +1 point awarded.
 * 7. Weekly feedback / vote: exactly +10 points awarded.
 * 8. Balance preservation: existing user points are untouched and additive.
 * 9. Notification engine: event-driven notifications generated for rewards, complaints, and redemptions.
 * 10. Unread count and read transitions: marks read individually and in batch.
 * 11. User isolation: Student A's ledger and notifications are completely isolated from Student B.
 * 12. Reward redemption: points safely deducted, claim code issued, and redemption notification created.
 */

import assert from 'node:assert';
import { db } from '../src/services/db.js';
import { getCollegeDateString } from '../src/utils/dateTime.js';

console.log('===============================================================');
console.log('  MESSMATES — REWARDS & NOTIFICATION ENGINE VERIFICATION');
console.log('===============================================================\n');

async function runTests() {
  const studentA = 'test_student_parth_001';
  const studentB = 'test_student_rohit_002';

  // Clear test state in db for clean run
  const initialUsers = [
    {
      id: studentA,
      uid: studentA,
      name: 'Parth Sharma',
      email: 'parth.25b15310212@abes.ac.in',
      rewardPoints: 50, // Pre-existing balance to test preservation!
      role: 'student'
    },
    {
      id: studentB,
      uid: studentB,
      name: 'Rohit Kumar',
      email: 'rohit.25b15310299@abes.ac.in',
      rewardPoints: 10,
      role: 'student'
    }
  ];
  db.setItem('users', initialUsers);
  db.setItem('reward_events', []);
  db.setItem('notifications', []);
  db.setItem('redemptions', []);

  console.log('[TEST 1] Balance Preservation Check');
  const userAInitial = db.getUserById(studentA);
  assert.strictEqual(userAInitial.rewardPoints, 50, 'Initial points must be exactly preserved (50)');
  console.log('  ✓ Initial student points preserved without wipe-out: 50 pts\n');

  console.log('[TEST 2] Daily Login Reward (+2 points) in Asia/Kolkata');
  const todayDate = getCollegeDateString();
  const loginRes1 = await db.awardDailyLoginReward(studentA);
  assert.strictEqual(loginRes1.awarded, true, 'First login of today must be awarded');
  assert.strictEqual(loginRes1.points, 2, 'Must award strictly 2 points');

  const userAAfterLogin = db.getUserById(studentA);
  assert.strictEqual(userAAfterLogin.rewardPoints, 52, 'Balance must be 50 + 2 = 52');
  console.log(`  ✓ Login on ${todayDate} awarded +2 points. New balance: 52 pts\n`);

  console.log('[TEST 3] Duplicate Same-Day Login Prevention');
  const loginRes2 = await db.awardDailyLoginReward(studentA);
  assert.strictEqual(loginRes2.awarded, false, 'Duplicate login on same day must be rejected');
  assert.strictEqual(loginRes2.points, 0, 'Must award 0 points on duplicate');

  const userAAfterDupLogin = db.getUserById(studentA);
  assert.strictEqual(userAAfterDupLogin.rewardPoints, 52, 'Balance must remain 52 pts');
  console.log('  ✓ Same-day repeated login awarded +0 points. Balance remains 52 pts\n');

  console.log('[TEST 4] Next Calendar Day Login (+2 points)');
  // Simulate next day: tomorrow's date string
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateStr = getCollegeDateString(tomorrow);

  const loginTomorrow = await db.awardRewardEvent({
    userId: studentA,
    type: 'LOGIN',
    points: 2,
    referenceId: tomorrowDateStr,
    description: 'Daily College Login',
    date: tomorrowDateStr
  });
  assert.strictEqual(loginTomorrow.awarded, true, 'Login on tomorrow must be awarded');
  assert.strictEqual(loginTomorrow.points, 2, 'Tomorrow login must award +2 points');

  const userAAfterTomorrow = db.getUserById(studentA);
  assert.strictEqual(userAAfterTomorrow.rewardPoints, 54, 'Balance must be 52 + 2 = 54');
  console.log(`  ✓ Next calendar day (${tomorrowDateStr}) awarded +2 points. New balance: 54 pts\n`);

  console.log('[TEST 5] Meal Rating Reward (+1 point per meal occurrence)');
  const occurrenceToday = `${todayDate}_fri_l`;
  const ratingRes1 = await db.awardRewardEvent({
    userId: studentA,
    type: 'MEAL_RATING',
    points: 1,
    referenceId: occurrenceToday,
    description: 'Mix Daal, Tarohi & Roti',
    date: todayDate
  });
  assert.strictEqual(ratingRes1.awarded, true, 'Rating on today occurrence must be awarded');
  assert.strictEqual(ratingRes1.points, 1, 'Must award strictly 1 point');

  const userAAfterRating = db.getUserById(studentA);
  assert.strictEqual(userAAfterRating.rewardPoints, 55, 'Balance must be 54 + 1 = 55');
  console.log(`  ✓ Rated "${occurrenceToday}" awarded +1 point. New balance: 55 pts\n`);

  console.log('[TEST 6] Duplicate Rating on Same Occurrence (+0 points)');
  const ratingRes2 = await db.awardRewardEvent({
    userId: studentA,
    type: 'MEAL_RATING',
    points: 1,
    referenceId: occurrenceToday,
    description: 'Mix Daal, Tarohi & Roti',
    date: todayDate
  });
  assert.strictEqual(ratingRes2.awarded, false, 'Duplicate rating on same occurrence must be rejected');
  assert.strictEqual(ratingRes2.points, 0, 'Duplicate rating must award 0 points');

  const userAAfterDupRating = db.getUserById(studentA);
  assert.strictEqual(userAAfterDupRating.rewardPoints, 55, 'Balance must remain 55 pts');
  console.log('  ✓ Duplicate rating on same occurrence rejected. Balance remains 55 pts\n');

  console.log('[TEST 7] Same Recurring Dish in New Week (+1 point)');
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekDateStr = getCollegeDateString(nextWeekDate);
  const occurrenceNextWeek = `${nextWeekDateStr}_fri_l`;

  const ratingResNextWeek = await db.awardRewardEvent({
    userId: studentA,
    type: 'MEAL_RATING',
    points: 1,
    referenceId: occurrenceNextWeek,
    description: 'Mix Daal, Tarohi & Roti',
    date: nextWeekDateStr
  });
  assert.strictEqual(ratingResNextWeek.awarded, true, 'Rating next week occurrence must be awarded');
  assert.strictEqual(ratingResNextWeek.points, 1, 'Next week recurring dish must award +1 point');

  const userAAfterNextWeekRating = db.getUserById(studentA);
  assert.strictEqual(userAAfterNextWeekRating.rewardPoints, 56, 'Balance must be 55 + 1 = 56');
  console.log(`  ✓ Recurring dish next week (${occurrenceNextWeek}) awarded +1 point. New balance: 56 pts\n`);

  console.log('[TEST 8] Weekly Dish Feedback / Vote (+10 points)');
  const voteId = `vote_${studentA}_2026-W36_paneer_butter_masala`;
  const voteRes = await db.awardRewardEvent({
    userId: studentA,
    type: 'VOTE',
    points: 10,
    referenceId: voteId,
    description: 'Weekly Feedback: Paneer Butter Masala',
    date: todayDate
  });
  assert.strictEqual(voteRes.awarded, true, 'Vote must be awarded');
  assert.strictEqual(voteRes.points, 10, 'Vote must award strictly 10 points');

  const userAAfterVote = db.getUserById(studentA);
  assert.strictEqual(userAAfterVote.rewardPoints, 66, 'Balance must be 56 + 10 = 66');
  console.log(`  ✓ Dish vote awarded +10 points. New balance: 66 pts\n`);

  console.log('[TEST 9] User Isolation (Student A vs Student B)');
  // Student B logs in
  const loginB = await db.awardDailyLoginReward(studentB);
  assert.strictEqual(loginB.awarded, true);

  const userB = db.getUserById(studentB);
  assert.strictEqual(userB.rewardPoints, 12, 'Student B balance must be 10 + 2 = 12');

  const studentAEvents = db.getUserRewardEvents(studentA);
  const studentBEvents = db.getUserRewardEvents(studentB);
  assert.strictEqual(studentBEvents.length, 1, 'Student B must have exactly 1 event');
  assert.strictEqual(studentAEvents.length, 5, 'Student A must have exactly 5 events');
  assert.ok(studentAEvents.every(e => e.userId === studentA), 'All student A events must belong to Student A');
  assert.ok(studentBEvents.every(e => e.userId === studentB), 'All student B events must belong to Student B');
  console.log('  ✓ Strict ledger isolation verified: Student A and Student B data never cross-leak\n');

  console.log('[TEST 10] Real-time Notifications & Read Transitions');
  const studentANotifs = db.getUserNotifications(studentA);
  assert.strictEqual(studentANotifs.length, 5, 'Student A must have 5 notifications from events');
  const unreadCountBefore = studentANotifs.filter(n => !n.read).length;
  assert.strictEqual(unreadCountBefore, 5, 'All 5 must initially be unread');

  // Mark single notification as read
  const firstNotifId = studentANotifs[0].id;
  await db.markNotificationAsRead(firstNotifId);

  const studentANotifsAfterSingle = db.getUserNotifications(studentA);
  const unreadAfterSingle = studentANotifsAfterSingle.filter(n => !n.read).length;
  assert.strictEqual(unreadAfterSingle, 4, 'Unread count must decrease to 4');
  console.log('  ✓ Single notification mark-as-read verified (unread count 5 -> 4)');

  // Mark all as read
  await db.markAllUserNotificationsRead(studentA, studentANotifsAfterSingle.filter(n => !n.read));
  const studentANotifsAfterAll = db.getUserNotifications(studentA);
  const unreadAfterAll = studentANotifsAfterAll.filter(n => !n.read).length;
  assert.strictEqual(unreadAfterAll, 0, 'Unread count must be 0 after Mark All Read');
  console.log('  ✓ Batch mark-all-read verified (unread count 4 -> 0)\n');

  console.log('[TEST 11] Complaint Status Update Notification');
  // Seed a complaint for Student A
  const testComplaint = {
    id: 'cmp_test_101',
    userId: studentA,
    userName: 'Parth Sharma',
    category: 'Food Quality',
    description: 'Cold chapatis served at dinner',
    status: 'PENDING',
    timestamp: new Date().toISOString()
  };
  db.setItem('complaints', [testComplaint]);

  // Committee / Warden updates status to 'IN REVIEW'
  await db.updateComplaintStatus('cmp_test_101', 'IN REVIEW');
  const notifsAfterCmpReview = db.getUserNotifications(studentA);
  const cmpReviewNotif = notifsAfterCmpReview.find(n => n.referenceId === 'cmp_test_101' && n.title.includes('Status Updated'));
  assert.ok(cmpReviewNotif, 'Must create notification when complaint is IN REVIEW');

  // Committee / Warden updates status to 'RESOLVED'
  await db.updateComplaintStatus('cmp_test_101', 'RESOLVED');
  const notifsAfterCmpResolved = db.getUserNotifications(studentA);
  const cmpResolvedNotif = notifsAfterCmpResolved.find(n => n.referenceId === 'cmp_test_101' && n.title.includes('Resolved'));
  assert.ok(cmpResolvedNotif, 'Must create notification when complaint is RESOLVED');
  console.log('  ✓ Complaint status transitions (PENDING -> IN REVIEW -> RESOLVED) notify student\n');

  console.log('[TEST 12] Reward Redemption with Safety & Notifications');
  const rewardItem = {
    id: 'rew_curd_cup',
    name: 'Extra Amul Curd Cup',
    points: 15
  };

  const currentPointsBefore = db.getUserById(studentA).rewardPoints; // 66
  const redemption = await db.redeemReward(studentA, 'Parth Sharma', rewardItem);
  assert.ok(redemption.claimCode.startsWith('HEALTHY-'), 'Claim code must start with HEALTHY-');

  const currentPointsAfter = db.getUserById(studentA).rewardPoints;
  assert.strictEqual(currentPointsAfter, currentPointsBefore - 15, `Balance must be ${currentPointsBefore} - 15 = ${currentPointsBefore - 15}`);

  const redNotif = db.getUserNotifications(studentA).find(n => n.referenceId === redemption.id);
  assert.ok(redNotif, 'Redemption notification must exist in student drawer');
  assert.strictEqual(redNotif.title, 'Reward Claimed 🎁');
  console.log(`  ✓ Redemption claimed "${rewardItem.name}" with code ${redemption.claimCode}. Balance: 66 -> 51 pts\n`);

  console.log('===============================================================');
  console.log('  ALL 12 TESTS PASSED! REWARDS & NOTIFICATIONS ARE ROCK-SOLID!');
  console.log('===============================================================\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

