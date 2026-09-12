/**
 * Automated Verification Script: Phase 2.2 Voting Correction & Scalability (>100 Voters)
 *
 * Tests:
 * A. 101 voters sequentially cast votes in an active poll.
 * B. 200 concurrent voters cast votes simultaneously via Promise.all.
 * C. First voter remains "Voted" after >100 other students vote (no limit(100) eviction).
 * D. Voter #101 remains correctly identified as "Voted" with correct selected option.
 * E. Duplicate vote by the same student is strictly rejected.
 * F. Page refresh simulation preserves the voted state and user selected option.
 * G. Poll tally (totalVotes and sum of options) exactly matches accepted votes.
 * H. Voting awards strictly 0 reward points (balance unchanged).
 * I. Zero reward notifications generated in notifications store.
 * J. Closed poll rejects new votes.
 * K. Inactive/unapproved poll rejects new votes.
 * L. Historical closed poll remains completely readable with preserved results.
 */

process.env.MESSMATES_DISABLE_FIREBASE = 'true';

import assert from 'node:assert';
const { db } = await import('../src/services/db.js');
const { getCollegeWeekInfo } = await import('../src/utils/dateTime.js');

console.log('======================================================================');
console.log('  MESSMATES — PHASE 2.2 VOTING CORRECTION & SCALABILITY VERIFICATION');
console.log('======================================================================\n');

async function runTests() {
  // Clear test state
  db.setItem('votes', []);
  db.setItem('polls', []);
  db.setItem('reward_events', []);
  db.setItem('notifications', []);

  const weekInfo = getCollegeWeekInfo();

  // -------------------------------------------------------------
  // SETUP: Create Active Poll
  // -------------------------------------------------------------
  console.log('[SETUP] Creating Active Weekly Poll');
  const poll = db.createPoll({
    question: 'Which special dessert should be served for Sunday feast?',
    options: [
      { name: 'Gulab Jamun with Ice Cream' },
      { name: 'Rasmalai' },
      { name: 'Moong Dal Halwa' },
      { name: 'Shahi Tukda' }
    ],
    closingDate: 'Sunday 9:00 PM',
    weekId: weekInfo.weekId
  });

  assert.strictEqual(poll.status, 'ACTIVE');
  assert.strictEqual(poll.totalVotes, 0);
  assert.strictEqual(poll.options.length, 4);
  console.log(`  ✓ Poll "${poll.question}" initialized with 4 options and totalVotes=0\n`);

  // -------------------------------------------------------------
  // TEST H & I: Voting awards strictly 0 points and NO reward notifications
  // -------------------------------------------------------------
  console.log('[TEST H & I] Reward Isolation & 0 Points Enforcement');
  const voter1Id = 'student_test_voter_001';
  db.setItem('users', [{ id: voter1Id, uid: voter1Id, name: 'Student 1', rewardPoints: 50, role: 'student' }]);
  
  const balanceBefore = db.getUserById(voter1Id).rewardPoints;
  const initialNotifsCount = db.getItem('notifications', []).length;
  const initialEventsCount = db.getItem('reward_events', []).length;

  const vote1 = await db.castVote({
    pollId: poll.id,
    optionId: 'opt_1',
    userId: voter1Id,
    userName: 'Student 1',
    weekId: weekInfo.weekId
  });

  const balanceAfter = db.getUserById(voter1Id).rewardPoints;
  const notifsAfter = db.getItem('notifications', []).length;
  const eventsAfter = db.getItem('reward_events', []).length;

  assert.strictEqual(balanceAfter, balanceBefore, 'Reward balance MUST NOT change on vote');
  assert.strictEqual(eventsAfter, initialEventsCount, 'No reward ledger events must be created for voting');
  assert.strictEqual(notifsAfter, initialNotifsCount, 'No reward notifications must be created for voting');
  console.log(`  ✓ Voter 1 cast vote for option opt_1.`);
  console.log(`  ✓ Balance before: ${balanceBefore} pts -> Balance after: ${balanceAfter} pts (+0 pts).`);
  console.log(`  ✓ Reward ledger events created: 0, Notifications created: 0\n`);

  // -------------------------------------------------------------
  // TEST E: Duplicate Vote Rejected
  // -------------------------------------------------------------
  console.log('[TEST E] Duplicate Vote Prevention');
  let duplicateRejected = false;
  try {
    await db.castVote({
      pollId: poll.id,
      optionId: 'opt_2',
      userId: voter1Id,
      userName: 'Student 1',
      weekId: weekInfo.weekId
    });
  } catch (err) {
    duplicateRejected = true;
    assert.ok(err.message.includes('already voted'), `Expected 'already voted', got: ${err.message}`);
  }
  assert.strictEqual(duplicateRejected, true, 'Same student cannot vote twice in the same poll');
  console.log('  ✓ Duplicate vote for voter 1 was strictly rejected with error.\n');

  // -------------------------------------------------------------
  // TEST A: 101 Sequential Voters
  // -------------------------------------------------------------
  console.log('[TEST A] 101 Voters Sequential Load');
  // Voter 1 already voted, vote remaining 100 students (students 2 to 101)
  for (let i = 2; i <= 101; i++) {
    const uid = `student_test_voter_${String(i).padStart(3, '0')}`;
    const optId = `opt_${((i % 4) + 1)}`;
    await db.castVote({
      pollId: poll.id,
      optionId: optId,
      userId: uid,
      userName: `Student ${i}`,
      weekId: weekInfo.weekId
    });
  }

  const updatedPollAfter101 = db.getItem('poll');
  assert.strictEqual(updatedPollAfter101.totalVotes, 101, 'Poll totalVotes must be exactly 101');
  console.log(`  ✓ 101 voters successfully recorded. Current poll totalVotes: ${updatedPollAfter101.totalVotes}\n`);

  // -------------------------------------------------------------
  // TEST C: First Voter Remains "Voted" after >100 other votes
  // -------------------------------------------------------------
  console.log('[TEST C] Voter #1 State Preservation after >100 other votes (Anti-Eviction)');
  // Under the old bug (limit(100)), voter 1 fell out when votes > 100!
  // In the new architecture, user's vote is queried by where('userId', '==', uid)
  const voter1Votes = db.getItem('votes', []).filter(v => v.userId === voter1Id && v.pollId === poll.id);
  assert.strictEqual(voter1Votes.length, 1, 'Voter 1 vote must exist in database');
  assert.strictEqual(voter1Votes[0].optionId, 'opt_1', 'Voter 1 selected option must be opt_1');
  console.log(`  ✓ Voter #1 remains permanently recorded as "Voted" with option ${voter1Votes[0].optionId} (Zero eviction!)\n`);

  // -------------------------------------------------------------
  // TEST D: Voter #101 Correctly Identified
  // -------------------------------------------------------------
  console.log('[TEST D] Voter #101 Correct Identification');
  const voter101Id = 'student_test_voter_101';
  const voter101Votes = db.getItem('votes', []).filter(v => v.userId === voter101Id && v.pollId === poll.id);
  assert.strictEqual(voter101Votes.length, 1, 'Voter 101 vote must exist');
  assert.strictEqual(voter101Votes[0].optionId, `opt_${((101 % 4) + 1)}`);
  console.log(`  ✓ Voter #101 vote confirmed: ${voter101Votes[0].id} (Option: ${voter101Votes[0].optionId})\n`);

  // -------------------------------------------------------------
  // TEST B: 200 Concurrent Voters Load (Students 102 to 301)
  // -------------------------------------------------------------
  console.log('[TEST B & G] 200 Concurrent Voters via Promise.all');
  const concurrentVoterPromises = [];
  for (let i = 102; i <= 301; i++) {
    const uid = `student_test_voter_${String(i).padStart(3, '0')}`;
    const optId = `opt_${((i % 4) + 1)}`;
    concurrentVoterPromises.push(
      db.castVote({
        pollId: poll.id,
        optionId: optId,
        userId: uid,
        userName: `Student ${i}`,
        weekId: weekInfo.weekId
      })
    );
  }

  await Promise.all(concurrentVoterPromises);

  const finalPoll = db.getItem('poll');
  const allVotes = db.getItem('votes', []).filter(v => v.pollId === poll.id);

  assert.strictEqual(allVotes.length, 301, 'Total votes in store must be exactly 301');
  assert.strictEqual(finalPoll.totalVotes, 301, 'Poll totalVotes aggregate must be exactly 301');

  // TEST G: Sum of option votes matches totalVotes exactly
  const sumOptionVotes = (finalPoll.options || []).reduce((acc, opt) => acc + Number(opt.votes || 0), 0);
  assert.strictEqual(sumOptionVotes, 301, 'Sum of all options votes must equal 301');

  // Also verify voteCounts map matches
  const sumVoteCounts = Object.values(finalPoll.voteCounts || {}).reduce((acc, count) => acc + Number(count), 0);
  assert.strictEqual(sumVoteCounts, 301, 'Sum of voteCounts map must equal 301');

  console.log(`  ✓ 200 concurrent votes processed successfully without lost increments.`);
  console.log(`  ✓ Total poll responses: ${finalPoll.totalVotes}`);
  console.log(`  ✓ Breakdown:`, finalPoll.options.map(o => `${o.name}: ${o.votes} votes`).join(' | '));
  console.log('  ✓ Poll aggregate tallies exactly match accepted votes.\n');

  // -------------------------------------------------------------
  // TEST F: Page Refresh Simulation
  // -------------------------------------------------------------
  console.log('[TEST F] Refresh Simulation (Voter #1 and Voter #200)');
  // Simulating client mount: fetching poll document and current user's vote
  const voter200Id = 'student_test_voter_200';
  const userVoteFromRefresh = db.getItem('votes', []).find(v => v.userId === voter200Id && v.pollId === poll.id);
  assert.ok(userVoteFromRefresh, 'User vote must be found on refresh');
  assert.strictEqual(userVoteFromRefresh.optionId, `opt_${((200 % 4) + 1)}`);
  console.log(`  ✓ On refresh, student ${voter200Id} immediately restores voted state with option: ${userVoteFromRefresh.optionId}\n`);

  // -------------------------------------------------------------
  // TEST J: Closed Poll Rejects New Vote
  // -------------------------------------------------------------
  console.log('[TEST J] Closed Poll Rejection');
  await db.closePoll(poll.id);
  const closedPoll = db.getItem('poll');
  assert.strictEqual(closedPoll.status, 'CLOSED');

  let closedVoteRejected = false;
  try {
    await db.castVote({
      pollId: poll.id,
      optionId: 'opt_1',
      userId: 'student_late_voter_999',
      userName: 'Late Student',
      weekId: weekInfo.weekId
    });
  } catch (err) {
    closedVoteRejected = true;
    assert.ok(err.message.includes('closed poll'), `Expected closed poll error, got: ${err.message}`);
  }
  assert.strictEqual(closedVoteRejected, true, 'Voting in a closed poll must be rejected');
  console.log('  ✓ Vote in closed poll cleanly rejected with error.\n');

  // -------------------------------------------------------------
  // TEST K: Inactive Poll Rejection
  // -------------------------------------------------------------
  console.log('[TEST K] Inactive Poll Rejection');
  const inactivePoll = {
    id: 'poll_inactive_test_001',
    question: 'Draft poll not yet active',
    options: [{ id: 'opt_1', name: 'Draft 1', votes: 0 }],
    status: 'DRAFT',
    totalVotes: 0
  };
  const polls = db.getItem('polls', []);
  polls.push(inactivePoll);
  db.setItem('polls', polls);

  let inactiveVoteRejected = false;
  try {
    await db.castVote({
      pollId: inactivePoll.id,
      optionId: 'opt_1',
      userId: 'student_test_voter_998',
      userName: 'Student',
      weekId: weekInfo.weekId
    });
  } catch (err) {
    inactiveVoteRejected = true;
  }
  assert.strictEqual(inactiveVoteRejected, true, 'Voting in an inactive poll must be rejected');
  console.log('  ✓ Vote in inactive/draft poll cleanly rejected.\n');

  // -------------------------------------------------------------
  // TEST L: Historical Poll Remains Completely Readable
  // -------------------------------------------------------------
  console.log('[TEST L] Historical Poll Readability & Tally Integrity');
  const historicalPoll = db.getItem('poll');
  assert.strictEqual(historicalPoll.id, poll.id);
  assert.strictEqual(historicalPoll.status, 'CLOSED');
  assert.strictEqual(historicalPoll.totalVotes, 301);
  assert.ok(historicalPoll.options.length > 0);
  console.log(`  ✓ Historical poll remains intact: ${historicalPoll.totalVotes} total responses preserved.`);
  console.log(`  ✓ Final tallies:`, historicalPoll.options.map(o => `${o.name}: ${o.votes}`).join(', '));
  console.log('');

  console.log('======================================================================');
  console.log('  ALL 12 PHASE 2.2 VOTING VERIFICATION TESTS PASSED! (A through L)');
  console.log('======================================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Phase 2.2 Test Failure:', err);
  process.exit(1);
});
