/**
 * Automated Verification Script: Phase 2.3 — Rating Identity & Meal Occurrence Safety
 *
 * Verifies:
 * A. Same student submits same meal occurrence twice -> exactly one rating accepted, second rejected.
 * B. Same student submits same meal occurrence concurrently -> exactly one accepted, rest rejected.
 * C. Same student rates same dish next week -> accepted with separate occurrence ID.
 * D. Same student rates different meal occurrence on same day -> accepted with separate occurrence ID.
 * E. Two different students rate same meal occurrence -> both accepted with distinct deterministic IDs.
 * F. Rating +1 reward: same student + same occurrence -> exactly +1 point total.
 * G. Concurrent duplicate rating -> points never increase by +2 or more.
 * H. Historical random-ID ratings (rat_[0-9]+) remain readable and valid.
 * I. Security rules enforcement: deterministic document ID, immutability (update: false), and anti-tampering.
 */

// Enable offline test environment for reliable in-memory database assertions
process.env.MESSMATES_DISABLE_FIREBASE = 'true';

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const { db } = await import('../src/services/db.js');
const { getCollegeDateString } = await import('../src/utils/dateTime.js');

console.log('======================================================================');
console.log('  MESSMATES — PHASE 2.3 RATING IDENTITY & OCCURRENCE SAFETY VERIFICATION');
console.log('======================================================================\n');

async function runTests() {
  const studentA = 'test_student_parth_203';
  const studentB = 'test_student_rohit_204';
  const mealId = 'fri_l';
  const dinnerMealId = 'fri_d';
  const mealName = 'Mix Daal, Tarohi & Roti';
  const dinnerMealName = 'Dal Makhani & Paneer';
  const todayDate = '2026-09-12';
  const nextWeekDate = '2026-09-19';

  // 1. Reset test state
  db.setItem('users', [
    {
      id: studentA,
      uid: studentA,
      name: 'Parth Sharma',
      email: 'parth.25b15310212@abes.ac.in',
      rewardPoints: 50, // Initial balance
      role: 'student'
    },
    {
      id: studentB,
      uid: studentB,
      name: 'Rohit Kumar',
      email: 'rohit.25b15310299@abes.ac.in',
      rewardPoints: 30, // Initial balance
      role: 'student'
    }
  ]);
  db.setItem('ratings', []);
  db.setItem('reward_events', []);
  db.setItem('notifications', []);

  console.log('[SETUP] Initialized test state with Student A (50 pts) and Student B (30 pts)');

  // ------------------------------------------------------------------
  // TEST A: Same student submits same meal occurrence twice
  // ------------------------------------------------------------------
  console.log('\n[TEST A] Same student submits same meal occurrence twice');
  const occurrenceA = `${todayDate}_${mealId}`;
  const ratingA1 = await db.submitRating({
    userId: studentA,
    userName: 'Parth Sharma',
    mealId,
    mealName,
    rating: 4,
    feedback: 'Dal was great today',
    occurrenceDate: todayDate,
    mealOccurrenceId: occurrenceA
  });

  const expectedRatingIdA = `rating_${studentA}_${occurrenceA}`;
  assert.strictEqual(ratingA1.id, expectedRatingIdA, `Rating document ID must strictly follow deterministic format: ${expectedRatingIdA}`);
  assert.strictEqual(ratingA1.mealOccurrenceId, occurrenceA);
  assert.strictEqual(ratingA1.rating, 4);

  let duplicateThrew = false;
  try {
    await db.submitRating({
      userId: studentA,
      userName: 'Parth Sharma',
      mealId,
      mealName,
      rating: 5,
      feedback: 'Trying to submit duplicate rating',
      occurrenceDate: todayDate,
      mealOccurrenceId: occurrenceA
    });
  } catch (err) {
    duplicateThrew = true;
    assert.ok(err.message.includes('Rating already submitted for this meal occurrence'), 'Must reject duplicate submission with proper error message');
  }
  assert.strictEqual(duplicateThrew, true, 'Second submission for same student and occurrence MUST throw error');

  const ratingsAfterA = db.getAllRatings().filter(r => r.userId === studentA && r.mealOccurrenceId === occurrenceA);
  assert.strictEqual(ratingsAfterA.length, 1, 'Only exactly ONE rating must exist for Student A on this occurrence');
  console.log(`  ✓ Rating successfully accepted with deterministic ID: ${ratingA1.id}`);
  console.log('  ✓ Duplicate sequential submission was strictly rejected with error.');

  // ------------------------------------------------------------------
  // TEST B: Same student submits same meal occurrence concurrently
  // ------------------------------------------------------------------
  console.log('\n[TEST B] Same student submits same meal occurrence concurrently (5 concurrent calls)');
  // We will test on another fresh occurrence for Student B
  const occurrenceB = `${todayDate}_${dinnerMealId}`;
  const concurrentPromises = Array.from({ length: 5 }, (_, i) => 
    db.submitRating({
      userId: studentB,
      userName: 'Rohit Kumar',
      mealId: dinnerMealId,
      mealName: dinnerMealName,
      rating: 4 + (i % 2),
      feedback: `Concurrent test attempt ${i}`,
      occurrenceDate: todayDate,
      mealOccurrenceId: occurrenceB
    })
  );

  const results = await Promise.allSettled(concurrentPromises);
  const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
  const rejectedCount = results.filter(r => r.status === 'rejected').length;

  assert.strictEqual(fulfilledCount, 1, `Exactly 1 concurrent submission must succeed, got ${fulfilledCount}`);
  assert.strictEqual(rejectedCount, 4, `All 4 duplicate concurrent submissions must fail, got ${rejectedCount}`);

  const ratingsAfterB = db.getAllRatings().filter(r => r.userId === studentB && r.mealOccurrenceId === occurrenceB);
  assert.strictEqual(ratingsAfterB.length, 1, 'Database must contain exactly 1 rating record for Student B');
  console.log(`  ✓ 1 of 5 concurrent calls fulfilled (${ratingsAfterB[0].id})`);
  console.log(`  ✓ 4 of 5 concurrent calls rejected with duplicate submission error`);

  // ------------------------------------------------------------------
  // TEST C: Same student rates same dish next week (different occurrence)
  // ------------------------------------------------------------------
  console.log('\n[TEST C] Same student rates same dish next week');
  const occurrenceNextWeek = `${nextWeekDate}_${mealId}`;
  const nextWeekRating = await db.submitRating({
    userId: studentA,
    userName: 'Parth Sharma',
    mealId,
    mealName,
    rating: 5,
    feedback: 'Next week daal is even better!',
    occurrenceDate: nextWeekDate,
    mealOccurrenceId: occurrenceNextWeek
  });

  const expectedNextWeekId = `rating_${studentA}_${occurrenceNextWeek}`;
  assert.strictEqual(nextWeekRating.id, expectedNextWeekId);
  assert.strictEqual(nextWeekRating.mealOccurrenceId, occurrenceNextWeek);
  assert.strictEqual(nextWeekRating.rating, 5);

  const studentARatings = db.getAllRatings().filter(r => r.userId === studentA);
  assert.strictEqual(studentARatings.length, 2, 'Student A must have 2 distinct rating entries (today and next week)');
  console.log(`  ✓ Next week rating accepted with distinct deterministic ID: ${nextWeekRating.id}`);
  console.log('  ✓ Both occurrences exist independently without overwriting or interference.');

  // ------------------------------------------------------------------
  // TEST D: Same student rates different meal occurrence on same day
  // ------------------------------------------------------------------
  console.log('\n[TEST D] Same student rates different meal occurrence on same day (Lunch vs Dinner)');
  const occurrenceDinner = `${todayDate}_${dinnerMealId}`;
  const dinnerRating = await db.submitRating({
    userId: studentA,
    userName: 'Parth Sharma',
    mealId: dinnerMealId,
    mealName: dinnerMealName,
    rating: 4,
    feedback: 'Good dinner',
    occurrenceDate: todayDate,
    mealOccurrenceId: occurrenceDinner
  });

  assert.strictEqual(dinnerRating.id, `rating_${studentA}_${occurrenceDinner}`);
  const userLunchCheck = db.getUserRatingForMeal(studentA, mealId, todayDate);
  const userDinnerCheck = db.getUserRatingForMeal(studentA, dinnerMealId, todayDate);
  assert.ok(userLunchCheck, 'Lunch rating must be present');
  assert.ok(userDinnerCheck, 'Dinner rating must be present');
  assert.strictEqual(userLunchCheck.rating, 4);
  assert.strictEqual(userDinnerCheck.rating, 4);
  console.log(`  ✓ Dinner rating accepted: ${dinnerRating.id}`);
  console.log('  ✓ Both Lunch and Dinner ratings for same day are queryable and distinct.');

  // ------------------------------------------------------------------
  // TEST E: Two different students rate same meal occurrence
  // ------------------------------------------------------------------
  console.log('\n[TEST E] Two different students rate same meal occurrence');
  // Student B rating today's Lunch (which Student A already rated)
  const studentBTodayRating = await db.submitRating({
    userId: studentB,
    userName: 'Rohit Kumar',
    mealId,
    mealName,
    rating: 3,
    feedback: 'Rice was a bit cold',
    occurrenceDate: todayDate,
    mealOccurrenceId: occurrenceA
  });

  const expectedBId = `rating_${studentB}_${occurrenceA}`;
  assert.strictEqual(studentBTodayRating.id, expectedBId);
  assert.notStrictEqual(ratingA1.id, studentBTodayRating.id, 'IDs must be student-scoped and distinct');

  const checkA = db.getUserRatingForMeal(studentA, mealId, todayDate);
  const checkB = db.getUserRatingForMeal(studentB, mealId, todayDate);
  assert.strictEqual(checkA.rating, 4);
  assert.strictEqual(checkB.rating, 3);
  console.log(`  ✓ Student A ID: ${checkA.id} (Rating: ${checkA.rating}★)`);
  console.log(`  ✓ Student B ID: ${checkB.id} (Rating: ${checkB.rating}★)`);
  console.log('  ✓ Two students rating the same meal occurrence succeed with isolated records.');

  // ------------------------------------------------------------------
  // TEST F: Rating +1 reward: same student + same occurrence
  // ------------------------------------------------------------------
  console.log('\n[TEST F] Rating +1 reward: same student + same occurrence');
  const userAProfile = db.getUsers().find(u => u.id === studentA);
  // Student A started with 50, rated:
  // 1. today lunch (+1)
  // 2. next week lunch (+1)
  // 3. today dinner (+1)
  // Total expected = 50 + 3 = 53
  assert.strictEqual(userAProfile.rewardPoints, 53, `Student A points must be 53, got ${userAProfile.rewardPoints}`);

  const rewardEventsA = db.getItem('reward_events', []).filter(e => e.userId === studentA && e.type === 'MEAL_RATING');
  assert.strictEqual(rewardEventsA.length, 3, 'Must have exactly 3 reward events logged for Student A');
  assert.ok(rewardEventsA.every(e => e.points === 1), 'Each meal rating event must award strictly 1 point');
  console.log(`  ✓ Student A reward balance correctly incremented to ${userAProfile.rewardPoints} (+1 per valid occurrence)`);
  console.log('  ✓ All 3 MEAL_RATING reward events verified at strictly 1 point each.');

  // ------------------------------------------------------------------
  // TEST G: Concurrent duplicate rating: never +2 points
  // ------------------------------------------------------------------
  console.log('\n[TEST G] Concurrent duplicate rating: never +2 points');
  const userBBefore = db.getUsers().find(u => u.id === studentB).rewardPoints;
  // Student B started with 30, rated:
  // 1. today dinner (via concurrent batch, exactly 1 succeeded) (+1)
  // 2. today lunch (+1)
  // Current userB balance should be 32
  assert.strictEqual(userBBefore, 32, `Student B points must be 32, got ${userBBefore}`);

  // Now simulate 10 concurrent reward event attempts with the SAME occurrence ID
  const duplicateOccurrenceId = `${todayDate}_${mealId}`;
  const rewardTries = await Promise.all(
    Array.from({ length: 10 }, () =>
      db.awardRewardEvent({
        userId: studentB,
        type: 'MEAL_RATING',
        points: 1,
        referenceId: duplicateOccurrenceId,
        description: mealName,
        date: todayDate
      })
    )
  );

  const rewardedCount = rewardTries.filter(r => r.awarded === true).length;
  assert.strictEqual(rewardedCount, 0, 'Zero duplicate reward events must be awarded since Student B already rated this occurrence');

  const userBAfter = db.getUsers().find(u => u.id === studentB).rewardPoints;
  assert.strictEqual(userBAfter, userBBefore, `Student B balance must remain strictly ${userBBefore} (never +2 or extra points)`);
  console.log(`  ✓ 10 duplicate reward attempts evaluated: 0 awarded.`);
  console.log(`  ✓ Student B balance remained strictly ${userBAfter} pts (100% idempotent, zero inflation).`);

  // ------------------------------------------------------------------
  // TEST H: Historical random-ID rating remains readable
  // ------------------------------------------------------------------
  console.log('\n[TEST H] Historical random-ID rating remains readable');
  const historicalTimestamp = '2026-08-28T13:00:00.000Z';
  const historicalDate = '2026-08-28';
  const historicalRating = {
    id: 'rat_1724838400000', // Old random ID format!
    userId: studentA,
    userName: 'Parth Sharma',
    mealId: 'fri_l',
    mealName: 'Mix Daal, Tarohi & Roti',
    mealCategory: 'Lunch',
    rating: 3,
    feedback: 'Historical rating before Phase 2.3',
    date: historicalDate,
    timestamp: historicalTimestamp
    // Note: older ratings may NOT have mealOccurrenceId or deterministic id
  };

  const allRatingsWithHistorical = [historicalRating, ...db.getAllRatings()];
  db.setItem('ratings', allRatingsWithHistorical);

  // Retrieve historical rating via getUserRatingForMeal
  const retrievedHistorical = db.getUserRatingForMeal(studentA, 'fri_l', historicalDate);
  assert.ok(retrievedHistorical, 'Must successfully find historical rating on 2026-08-28');
  assert.strictEqual(retrievedHistorical.id, 'rat_1724838400000', 'Historical ID preserved unchanged');
  assert.strictEqual(retrievedHistorical.rating, 3);
  assert.strictEqual(retrievedHistorical.feedback, 'Historical rating before Phase 2.3');

  // Verify historical rating does not collide with today's rating
  const retrievedToday = db.getUserRatingForMeal(studentA, 'fri_l', todayDate);
  assert.ok(retrievedToday);
  assert.strictEqual(retrievedToday.id, expectedRatingIdA);
  assert.strictEqual(retrievedToday.rating, 4);

  console.log(`  ✓ Historical rating retrieved: ${retrievedHistorical.id} (${retrievedHistorical.rating}★ on ${retrievedHistorical.date})`);
  console.log(`  ✓ Today's rating retrieved independently: ${retrievedToday.id} (${retrievedToday.rating}★ on ${retrievedToday.date})`);
  console.log('  ✓ Historical random-ID ratings remain 100% backward compatible without migration.');

  // ------------------------------------------------------------------
  // TEST I: Security Rules Audit for /ratings/{ratingId}
  // ------------------------------------------------------------------
  console.log('\n[TEST I] Firestore Security Rules audit for /ratings/{ratingId}');
  const rulesPath = path.resolve('firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // 1. Check deterministic ID enforcement
  const deterministicIdPattern = /ratingId\s*==\s*['"]rating_['"]\s*\+\s*request\.auth\.uid\s*\+\s*['"]_['"]\s*\+\s*request\.resource\.data\.mealOccurrenceId/;
  assert.ok(deterministicIdPattern.test(rulesContent), 'Rules must enforce ratingId == rating_uid_mealOccurrenceId');
  console.log('  ✓ Rule enforces deterministic ID: ratingId == "rating_" + request.auth.uid + "_" + mealOccurrenceId');

  // 2. Check duplicate existence prevention
  const notExistsPattern = /!exists\s*\(\s*\/databases\/\$\(database\)\/documents\/ratings\/\$\(ratingId\)\s*\)/;
  assert.ok(notExistsPattern.test(rulesContent), 'Rules must enforce !exists(/databases/$(database)/documents/ratings/$(ratingId))');
  console.log('  ✓ Rule enforces !exists(/databases/$(database)/documents/ratings/$(ratingId))');

  // 3. Check student-only restriction
  const isStudentPattern = /isStudent\s*\(\s*\)/;
  assert.ok(isStudentPattern.test(rulesContent), 'Rules must enforce isStudent()');
  console.log('  ✓ Rule enforces isStudent() authorization');

  // 4. Check immutability (update: false)
  const updateFalsePattern = /allow\s+update\s*:\s*if\s+false\s*;/;
  assert.ok(updateFalsePattern.test(rulesContent), 'Rules must enforce allow update: if false');
  console.log('  ✓ Rule enforces immutability: allow update: if false');

  console.log('\n======================================================================');
  console.log('  ALL PHASE 2.3 RATING SAFETY TESTS PASSED PERFECTLY! (A through I) 🎉');
  console.log('======================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
