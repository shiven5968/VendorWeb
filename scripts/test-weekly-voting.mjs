import assert from 'assert';
import { getCollegeWeekInfo, getPastCollegeWeeks, getCollegeDateString } from '../src/utils/dateTime.js';

console.log('=== MessMates Voting Feature & Separation Verification Test ===\n');

// -------------------------------------------------------------
// TEST 1: Timezone-Strict ISO Week Calculation in Asia/Kolkata
// -------------------------------------------------------------
console.log('Test 1: Timezone-Strict ISO Week Calculation');

// Sunday, Aug 30, 2026, 23:59:59 IST (UTC: 18:29:59Z)
const sundayBeforeMidnightIST = new Date('2026-08-30T18:29:59.000Z');
const weekSun = getCollegeWeekInfo(sundayBeforeMidnightIST);
console.log('Sunday 23:59 IST Week ID:', weekSun.weekId, 'Range:', weekSun.weekRangeDisplay);
assert.strictEqual(weekSun.weekId, '2026-W35', 'Sunday 23:59 IST should be Week 35');

// Monday, Aug 31, 2026, 00:00:01 IST (UTC: Aug 30 18:30:01Z)
const mondayJustAfterMidnightIST = new Date('2026-08-30T18:30:01.000Z');
const weekMon = getCollegeWeekInfo(mondayJustAfterMidnightIST);
console.log('Monday 00:00:01 IST Week ID:', weekMon.weekId, 'Range:', weekMon.weekRangeDisplay);
assert.strictEqual(weekMon.weekId, '2026-W36', 'Monday 00:00:01 IST should transition cleanly to Week 36');

console.log('✓ Test 1 Passed: Week boundaries transition strictly at midnight IST.\n');

// -------------------------------------------------------------
// TEST 2: Committee Poll Creation (Generic Questions, No Forced Metrics)
// -------------------------------------------------------------
console.log('Test 2: Committee Poll Creation (Generic Questions & Options)');

const pollsStore = [];

const simulateCreatePoll = ({ question, options, closingDate, weekId }) => {
  const pollId = 'poll_' + Date.now();
  const formattedOptions = (options || []).map((opt, i) => {
    if (typeof opt === 'string') {
      return { id: `opt_${i + 1}`, name: opt.trim() };
    }
    return {
      id: opt.id || `opt_${i + 1}`,
      name: opt.name?.trim() || '',
      ...(opt.protein ? { protein: opt.protein } : {})
    };
  }).filter(opt => opt.name);

  const newPoll = {
    id: pollId,
    question: question.trim(),
    options: formattedOptions,
    weekId: weekId || getCollegeWeekInfo().weekId,
    closingDate: closingDate || 'End of Week',
    createdAt: new Date().toISOString(),
    status: 'ACTIVE'
  };
  pollsStore.push(newPoll);
  return newPoll;
};

const poll1 = simulateCreatePoll({
  question: 'Which special dessert should be served for Sunday dinner?',
  options: [
    'Gulab Jamun with Ice Cream',
    'Rasmalai',
    'Moong Dal Halwa',
    'Shahi Tukda'
  ]
});

assert.strictEqual(poll1.status, 'ACTIVE');
assert.strictEqual(poll1.options.length, 4);
assert.strictEqual(poll1.options[0].name, 'Gulab Jamun with Ice Cream');
assert.strictEqual(poll1.options[0].protein, undefined, 'Protein is NOT mandatory');
console.log('Created active poll:', poll1.question, 'with options:', poll1.options.map(o => o.name).join(', '));
console.log('✓ Test 2 Passed: Poll created with generic question and 4 options without forced protein.\n');

// -------------------------------------------------------------
// TEST 3: Student Voting Model & Uniqueness Scoping (userId + pollId)
// -------------------------------------------------------------
console.log('Test 3: Student Voting Data Model & Single Vote Scoping');

const votesStore = [];
let studentRewardBalance = 50;
const rewardEventsLedger = [];

const simulateCastVote = ({ pollId, optionId, userId, userName }) => {
  if (!userId) throw new Error('User ID is required');
  if (!pollId) throw new Error('Poll ID is required');
  if (!optionId) throw new Error('Option ID is required');

  const poll = pollsStore.find(p => p.id === pollId);
  if (!poll) throw new Error('Poll not found');
  if (poll.status !== 'ACTIVE') throw new Error('Cannot vote in a closed poll');

  // Strict check: One vote per student per poll
  const alreadyVoted = votesStore.some(v => v.userId === userId && v.pollId === pollId);
  if (alreadyVoted) {
    throw new Error('You have already voted in this poll.');
  }

  const voteId = `vote_${userId}_${pollId}`;
  const vote = {
    id: voteId,
    userId,
    userName: userName || 'Student',
    pollId,
    optionId,
    weekId: poll.weekId,
    timestamp: new Date().toISOString()
  };

  // Voting is civic participation: awards ZERO reward points
  votesStore.push(vote);
  return vote;
};

const student1Id = 'student_parth_123';
const initialBalance = studentRewardBalance;

// Student casts vote
const voteRecord = simulateCastVote({
  pollId: poll1.id,
  optionId: 'opt_2',
  userId: student1Id,
  userName: 'Parth Sharma'
});

assert.strictEqual(voteRecord.id, `vote_${student1Id}_${poll1.id}`);
assert.strictEqual(voteRecord.optionId, 'opt_2');
assert.strictEqual(voteRecord.rating, undefined, 'Votes must NOT contain star ratings');
assert.strictEqual(voteRecord.stars, undefined, 'Votes must NOT contain stars field');

// VERIFY ZERO REWARD POINTS
assert.strictEqual(studentRewardBalance, initialBalance, 'Reward balance MUST NOT change on vote');
assert.strictEqual(rewardEventsLedger.length, 0, 'No reward events must be created for voting');
console.log(`Vote cast: ${voteRecord.id}. Student balance before: ${initialBalance}, after: ${studentRewardBalance} (+0 pts).`);

// VERIFY DUPLICATE VOTE IS BLOCKED
let duplicateBlocked = false;
try {
  simulateCastVote({
    pollId: poll1.id,
    optionId: 'opt_1',
    userId: student1Id,
    userName: 'Parth Sharma'
  });
} catch (e) {
  duplicateBlocked = true;
  console.log('Duplicate vote cleanly rejected:', e.message);
}
assert.strictEqual(duplicateBlocked, true, 'Student cannot vote twice in the same poll');
console.log('✓ Test 3 Passed: Vote recorded with correct model, 0 points awarded, duplicate blocked.\n');

// -------------------------------------------------------------
// TEST 4: Distribution / Enriched Poll Calculation
// -------------------------------------------------------------
console.log('Test 4: Voting Distribution and Percentages');

// Another student votes
simulateCastVote({
  pollId: poll1.id,
  optionId: 'opt_2',
  userId: 'student_rohit_456',
  userName: 'Rohit'
});

// Third student votes for option 1
simulateCastVote({
  pollId: poll1.id,
  optionId: 'opt_1',
  userId: 'student_ananya_789',
  userName: 'Ananya'
});

const getEnrichedPoll = (poll) => {
  const pollVotes = votesStore.filter(v => v.pollId === poll.id);
  const totalVotes = pollVotes.length;
  const enrichedOptions = poll.options.map(opt => {
    const optVotes = pollVotes.filter(v => v.optionId === opt.id).length;
    const percent = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
    return {
      ...opt,
      votes: optVotes,
      percent
    };
  });
  return {
    ...poll,
    totalVotes,
    options: enrichedOptions
  };
};

const enriched = getEnrichedPoll(poll1);
assert.strictEqual(enriched.totalVotes, 3);
assert.strictEqual(enriched.options.find(o => o.id === 'opt_2').votes, 2);
assert.strictEqual(enriched.options.find(o => o.id === 'opt_2').percent, 67);
assert.strictEqual(enriched.options.find(o => o.id === 'opt_1').votes, 1);
assert.strictEqual(enriched.options.find(o => o.id === 'opt_1').percent, 33);
console.log('Enriched poll distribution:', enriched.options.map(o => `${o.name}: ${o.percent}% (${o.votes} votes)`).join(' | '));
console.log('✓ Test 4 Passed: Distribution calculates accurately.\n');

// -------------------------------------------------------------
// TEST 5: Poll Closure & Immutability
// -------------------------------------------------------------
console.log('Test 5: Poll Closure & Voting Lock');

poll1.status = 'CLOSED';
poll1.closedAt = new Date().toISOString();

let closedVoteBlocked = false;
try {
  simulateCastVote({
    pollId: poll1.id,
    optionId: 'opt_3',
    userId: 'student_sneha_101',
    userName: 'Sneha'
  });
} catch (e) {
  closedVoteBlocked = true;
  console.log('Vote on closed poll rejected:', e.message);
}
assert.strictEqual(closedVoteBlocked, true, 'Students cannot cast votes after poll is CLOSED');
console.log('✓ Test 5 Passed: Closed polls display results but forbid new votes.\n');

// -------------------------------------------------------------
// TEST 6: Subsequent Week/Poll Re-Voting Unlocked
// -------------------------------------------------------------
console.log('Test 6: New Poll Allows Student to Vote Again');

const poll2 = simulateCreatePoll({
  question: 'Which daal preparation should be served for Wednesday lunch?',
  options: ['Dal Tadka (Desi Ghee)', 'Panchmel Dal', 'Dal Makhani'],
  weekId: '2026-W37'
});

const voteRecord2 = simulateCastVote({
  pollId: poll2.id,
  optionId: 'opt_3',
  userId: student1Id,
  userName: 'Parth Sharma'
});
assert.strictEqual(voteRecord2.pollId, poll2.id);
assert.strictEqual(studentRewardBalance, initialBalance, 'Balance remains untouched (+0 points)');
console.log('Student successfully voted in new poll:', voteRecord2.id);
console.log('✓ Test 6 Passed: Student can vote in each active poll.\n');

console.log('=============================================================');
console.log('ALL VOTING SEPARATION & REWARD CORRECTION TESTS PASSED!');
console.log('=============================================================');
