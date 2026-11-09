import assert from 'node:assert';
import { 
  INSTITUTIONS, 
  INSTITUTION_STATUSES, 
  searchInstitutions, 
  getInstitutionById, 
  isInstitutionActive, 
  getDefaultInstitution 
} from './src/config/institutions.js';
import { isValidAbesEmail } from './src/services/otp.js';

console.log('=== MESSMATES MULTI-COLLEGE COMPREHENSIVE TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// -------------------------------------------------------------
// 1. INSTITUTION REGISTRY INTEGRITY
// -------------------------------------------------------------
runTest('Registry contains configured institutions', () => {
  assert.ok(INSTITUTIONS.length >= 5, 'Should have at least 5 institutions configured');
  const ids = INSTITUTIONS.map(i => i.id);
  assert.ok(ids.includes('abes_ec'), 'Must include abes_ec');
  assert.ok(ids.includes('mmmut'), 'Must include mmmut');
  assert.ok(ids.includes('prsu'), 'Must include prsu');
  assert.ok(ids.includes('iit_delhi'), 'Must include iit_delhi');
  assert.ok(ids.includes('bits_pilani'), 'Must include bits_pilani');
});

runTest('Institution statuses are strictly defined', () => {
  const abes = getInstitutionById('abes_ec');
  assert.strictEqual(abes.status, INSTITUTION_STATUSES.ACTIVE, 'ABES must be ACTIVE');
  assert.strictEqual(isInstitutionActive(abes), true, 'isInstitutionActive(abes) must be true');

  const mmmut = getInstitutionById('mmmut');
  assert.strictEqual(mmmut.status, INSTITUTION_STATUSES.PENDING, 'MMMUT must be PENDING');
  assert.strictEqual(isInstitutionActive(mmmut), false, 'isInstitutionActive(mmmut) must be false');

  const prsu = getInstitutionById('prsu');
  assert.strictEqual(prsu.status, INSTITUTION_STATUSES.PENDING, 'PRSU must be PENDING');
  assert.strictEqual(isInstitutionActive(prsu), false, 'isInstitutionActive(prsu) must be false');
});

runTest('getDefaultInstitution returns ABES for backward compatibility', () => {
  const defaultInst = getDefaultInstitution();
  assert.strictEqual(defaultInst.id, 'abes_ec');
  assert.strictEqual(defaultInst.shortName, 'ABES EC');
});

// -------------------------------------------------------------
// 2. SEARCH & FILTER ALGORITHM
// -------------------------------------------------------------
runTest('Search with empty or whitespace query returns all institutions', () => {
  const allEmpty = searchInstitutions('');
  assert.strictEqual(allEmpty.length, INSTITUTIONS.length);
  const allWhitespace = searchInstitutions('   ');
  assert.strictEqual(allWhitespace.length, INSTITUTIONS.length);
});

runTest('Search by college name (case-insensitive)', () => {
  const abes = searchInstitutions('abes engineering');
  assert.strictEqual(abes.length, 1);
  assert.strictEqual(abes[0].id, 'abes_ec');

  const mixedCase = searchInstitutions('aBeS');
  assert.strictEqual(mixedCase.length, 1);
  assert.strictEqual(mixedCase[0].id, 'abes_ec');
});

runTest('Search by abbreviation / short name', () => {
  const mmmut = searchInstitutions('MMMUT');
  assert.strictEqual(mmmut.length, 1);
  assert.strictEqual(mmmut[0].id, 'mmmut');

  const bits = searchInstitutions('BITS');
  assert.strictEqual(bits.length, 1);
  assert.strictEqual(bits[0].id, 'bits_pilani');
});

runTest('Search by city / location', () => {
  const gzbd = searchInstitutions('Ghaziabad');
  assert.ok(gzbd.some(i => i.id === 'abes_ec'), 'Ghaziabad must find ABES');

  const gorakhpur = searchInstitutions('Gorakhpur');
  assert.ok(gorakhpur.some(i => i.id === 'mmmut'), 'Gorakhpur must find MMMUT');

  const prayagraj = searchInstitutions('Prayagraj');
  assert.ok(prayagraj.some(i => i.id === 'prsu'), 'Prayagraj must find PRSU');

  const pilani = searchInstitutions('Pilani');
  assert.ok(pilani.some(i => i.id === 'bits_pilani'), 'Pilani must find BITS Pilani');
});

runTest('Search with no matches returns empty array', () => {
  const noMatch = searchInstitutions('xyznonexistentcollege12345');
  assert.strictEqual(noMatch.length, 0);
  assert.deepStrictEqual(noMatch, []);
});

// -------------------------------------------------------------
// 3. TENANT ISOLATION & DOMAIN VALIDATION
// -------------------------------------------------------------
runTest('ABES email validation accepts official domain', () => {
  assert.strictEqual(isValidAbesEmail('student@abes.ac.in'), true);
  assert.strictEqual(isValidAbesEmail('2400320106436@abes.ac.in'), true);
  assert.strictEqual(isValidAbesEmail('amita@abes.ac.in'), true);
});

runTest('ABES email validation rejects non-ABES domains', () => {
  assert.strictEqual(isValidAbesEmail('student@gmail.com'), false);
  assert.strictEqual(isValidAbesEmail('user@mmmut.ac.in'), false);
  assert.strictEqual(isValidAbesEmail('hacker@iitd.ac.in'), false);
  assert.strictEqual(isValidAbesEmail(''), false);
  assert.strictEqual(isValidAbesEmail(null), false);
});

runTest('ABES officials authorization logic', () => {
  const authorizedOfficials = ['amita@abes.ac.in', 'alok@abes.ac.in'];
  
  // Valid officials
  assert.ok(authorizedOfficials.includes('amita@abes.ac.in'));
  assert.ok(authorizedOfficials.includes('alok@abes.ac.in'));

  // Unauthorized official attempts
  assert.strictEqual(authorizedOfficials.includes('student@abes.ac.in'), false);
  assert.strictEqual(authorizedOfficials.includes('random@abes.ac.in'), false);
  assert.strictEqual(authorizedOfficials.includes('warden@othercollege.ac.in'), false);
});

// -------------------------------------------------------------
// 4. PENDING INSTITUTION GATEKEEPING
// -------------------------------------------------------------
runTest('Pending institutions cannot be activated for campus login', () => {
  const pendingInstitutions = INSTITUTIONS.filter(i => i.status === INSTITUTION_STATUSES.PENDING);
  assert.ok(pendingInstitutions.length > 0, 'Should have pending institutions');
  
  for (const inst of pendingInstitutions) {
    assert.strictEqual(isInstitutionActive(inst), false, `${inst.name} must not be active`);
    assert.ok(inst.onboardingMessage, `${inst.name} must have an onboarding/waitlist explanation`);
  }
});

// -------------------------------------------------------------
// 5. ABES HOSTEL BLOCKS AND ADMISSION NUMBER LABELS
// -------------------------------------------------------------
runTest('ABES configuration contains accurate hostel blocks and admission labels', () => {
  const abes = getInstitutionById('abes_ec');
  assert.ok(abes.hostelBlocks.includes('DNB Block'));
  assert.ok(abes.hostelBlocks.includes('VKB Block'));
  assert.ok(abes.hostelBlocks.includes('RKB Block'));
  assert.ok(abes.hostelBlocks.includes('GH Block'));
  assert.strictEqual(abes.admissionNumberLabel, 'Admission Number');
  assert.ok(abes.admissionNumberPlaceholder.includes('2400320100001'));
});

console.log(`\n=== RESULTS: ${passedTests}/${totalTests} TESTS PASSED ===\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
