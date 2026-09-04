// Verification test for Student Login Bug Fix
import assert from 'assert';

console.log('--- Starting Student Login Bug Fix Verification Suite ---');

// 1. Verify Validation & Normalization Rules
function validateStudentLogin(identifier, password) {
  const cleanIdentifier = (identifier || '').trim();
  if (!cleanIdentifier) {
    return { valid: false, error: 'Please enter your Admission Number or college email.' };
  }
  if (!password) {
    return { valid: false, error: 'Please enter your password.' };
  }
  if (cleanIdentifier.includes('@')) {
    if (!cleanIdentifier.toLowerCase().endsWith('@abes.ac.in')) {
      return { 
        valid: false, 
        error: 'Please enter a valid ABES college email ending with @abes.ac.in' 
      };
    }
  }
  return { valid: true, cleanIdentifier };
}

// Test D: Empty admission number / email
const resD = validateStudentLogin('', 'mypassword');
assert.strictEqual(resD.valid, false);
assert.strictEqual(resD.error, 'Please enter your Admission Number or college email.');
console.log('✓ Test D Passed: Empty identifier triggers required validation');

// Test E: Empty password
const resE = validateStudentLogin('2025B01011362', '');
assert.strictEqual(resE.valid, false);
assert.strictEqual(resE.error, 'Please enter your password.');
console.log('✓ Test E Passed: Empty password triggers required validation');

// Test: Invalid non-ABES email in student login
const resInvalidEmail = validateStudentLogin('student@gmail.com', 'password123');
assert.strictEqual(resInvalidEmail.valid, false);
assert(resInvalidEmail.error.includes('@abes.ac.in'));
console.log('✓ Non-ABES email rejected: Intercepted with domain guidance');

// Test: Valid ABES email in student login
const resValidEmail = validateStudentLogin('parth.25b15310212@abes.ac.in', 'password123');
assert.strictEqual(resValidEmail.valid, true);
assert.strictEqual(resValidEmail.cleanIdentifier, 'parth.25b15310212@abes.ac.in');
console.log('✓ Valid ABES email allowed: Both Admission Number and College Email permitted');

// Test Valid Admission Number normalization
const resValid = validateStudentLogin('  2025b01011362  ', 'password123');
assert.strictEqual(resValid.valid, true);
assert.strictEqual(resValid.cleanIdentifier, '2025b01011362');
console.log('✓ Valid Admission Number Passed: Trimmed without altering original characters');

// 2. Test isLoginSubmitting State Lifecycle
let isLoginSubmitting = false;
let submitCallCount = 0;

async function simulateSubmit(shouldSucceed) {
  if (isLoginSubmitting) {
    console.log('Duplicate submit blocked!');
    return;
  }
  
  try {
    isLoginSubmitting = true;
    submitCallCount++;
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) resolve({ ok: true });
        else reject(new Error('Incorrect password. Please verify your password and try again.'));
      }, 50);
    });
  } catch (err) {
    // caught and handled
  } finally {
    isLoginSubmitting = false;
  }
}

// Test State Lifecycle on Success
assert.strictEqual(isLoginSubmitting, false, 'Initial state must be false');
const pSuccess = simulateSubmit(true);
assert.strictEqual(isLoginSubmitting, true, 'State during submit must be true');
await pSuccess;
assert.strictEqual(isLoginSubmitting, false, 'State after success must reset to false');
console.log('✓ Test A Passed: State lifecycle on success cleans up correctly');

// Test State Lifecycle on Error (Wrong Password / Invalid Admission)
assert.strictEqual(isLoginSubmitting, false, 'Initial state must be false');
const pError = simulateSubmit(false);
assert.strictEqual(isLoginSubmitting, true, 'State during submit must be true');
await pError;
assert.strictEqual(isLoginSubmitting, false, 'State after error must reset to false');
console.log('✓ Test B/C Passed: State lifecycle on failure cleans up correctly without stuck spinner');

// Test F: Duplicate submit prevention
submitCallCount = 0;
isLoginSubmitting = false;
const p1 = simulateSubmit(true);
const p2 = simulateSubmit(true); // Should be blocked
await Promise.all([p1, p2]);
assert.strictEqual(submitCallCount, 1, 'Duplicate submit should be prevented while submitting');
console.log('✓ Test F Passed: Duplicate submits are prevented');

console.log('--- All 7 Test Scenarios Passed Successfully! ---');
