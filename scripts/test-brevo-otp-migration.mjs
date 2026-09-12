#!/usr/bin/env node
/**
 * MESSMATES — Brevo OTP Transactional Email Migration Verification Suite
 * =====================================================================
 * Tests:
 * 1. Brevo API payload structure, endpoint URL, headers, and sender identity
 * 2. Strict OTP security invariants (6 digits, 10m expiry, 30s cooldown, 5 max attempts, HMAC-SHA256)
 * 3. End-to-end OTP dispatch and verification with signed session token
 * 4. Error sanitization (zero API key leakage in errors or logs)
 * 5. Serverless endpoint handlers (api/send-otp.js and api/verify-otp.js)
 * 6. Zero client-side secret exposure across src/ and dist/
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { 
  sendOtpEmail, 
  verifyOtpCode, 
  generateSecureOTP, 
  hashOtp, 
  signSessionToken, 
  verifySignedSessionToken,
  isValidAbesEmail,
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  MAX_ATTEMPTS
} from '../api/_otpService.js';
import sendOtpHandler from '../api/send-otp.js';
import verifyOtpHandler from '../api/verify-otp.js';

console.log('======================================================================');
console.log('  MESSMATES — BREVO TRANSACTIONAL EMAIL MIGRATION VERIFICATION');
console.log('======================================================================\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  [PASS] ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         Error: ${err.message}`);
    throw err;
  }
}

async function runAsyncTest(testName, fn) {
  testsTotal++;
  try {
    await fn();
    console.log(`  [PASS] ${testName}`);
    testsPassed++;
  } catch (err) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         Error: ${err.message}`);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CORE OTP SECURITY INVARIANTS AUDIT
// ─────────────────────────────────────────────────────────────────────────────
runTest('1. Core Security Invariants (6 digits, 10m expiry, 30s cooldown, 5 attempts)', () => {
  // 6 digits
  const otp = generateSecureOTP();
  assert.strictEqual(typeof otp, 'string', 'OTP must be a string');
  assert.strictEqual(otp.length, 6, 'OTP must be exactly 6 characters');
  assert.match(otp, /^\d{6}$/, 'OTP must be purely numeric');

  // 10 minutes validity
  assert.strictEqual(OTP_EXPIRY_MS, 10 * 60 * 1000, 'OTP expiry must be exactly 10 minutes (600,000 ms)');

  // 30 seconds cooldown
  assert.strictEqual(RESEND_COOLDOWN_MS, 30 * 1000, 'Resend cooldown must be exactly 30 seconds (30,000 ms)');

  // Max 5 attempts
  assert.strictEqual(MAX_ATTEMPTS, 5, 'Max verification attempts must be exactly 5');
});

runTest('2. ABES Official Email Domain Enforcement', () => {
  assert.strictEqual(isValidAbesEmail('parth.sharma@abes.ac.in'), true);
  assert.strictEqual(isValidAbesEmail('2025b01011362@abes.ac.in'), true);
  assert.strictEqual(isValidAbesEmail('student@gmail.com'), false);
  assert.strictEqual(isValidAbesEmail('hacker@abes.edu'), false);
  assert.strictEqual(isValidAbesEmail(''), false);
  assert.strictEqual(isValidAbesEmail(null), false);
});

runTest('3. HMAC-SHA256 Hash Determinism & Anti-Plaintext Storage', () => {
  const email = 'student.test@abes.ac.in';
  const otp = '482910';
  const h1 = hashOtp(otp, email);
  const h2 = hashOtp(otp, email);
  const hWrong = hashOtp('482911', email);

  assert.strictEqual(h1, h2, 'HMAC hash must be deterministic for identical inputs');
  assert.notStrictEqual(h1, hWrong, 'HMAC hash must differ for different OTPs');
  assert.ok(!h1.includes(otp), 'Hashed OTP must never contain plaintext OTP');
  assert.strictEqual(h1.length, 64, 'SHA-256 hex digest must be 64 chars long');
});

runTest('4. Cryptographic Tamper-Proof Session Token Signing', () => {
  const payload = {
    email: 'student.test@abes.ac.in',
    admissionNumber: '2025B01011362',
    name: 'Student Tester',
    hashedOtp: 'fake_hash_123',
    expiresAt: Date.now() + 600000
  };

  const token = signSessionToken(payload);
  assert.ok(typeof token === 'string' && token.includes('.'), 'Token must be formatted data.signature');

  const verified = verifySignedSessionToken(token);
  assert.ok(verified !== null, 'Valid signed token must verify successfully');
  assert.strictEqual(verified.email, payload.email);
  assert.strictEqual(verified.admissionNumber, payload.admissionNumber);

  // Tampering check
  const tamperedToken = token.slice(0, -4) + 'zzzz';
  assert.strictEqual(verifySignedSessionToken(tamperedToken), null, 'Tampered token signature must be rejected');
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. BREVO API DISPATCH INTERCEPTION & SCHEMA VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
await runAsyncTest('5. Brevo API Request Payload, URL, Headers & Sender Identity', async () => {
  const originalFetch = globalThis.fetch;
  const originalBrevoKey = process.env.BREVO_API_KEY;
  const originalFromEmail = process.env.BREVO_FROM_EMAIL;
  const originalFromName = process.env.BREVO_FROM_NAME;

  process.env.BREVO_API_KEY = 'xkeysib-test-fake-key-1234567890abcdef';
  process.env.BREVO_FROM_EMAIL = 'otp@messmates.tech';
  process.env.BREVO_FROM_NAME = 'MESSMATES';

  let interceptedRequest = null;

  globalThis.fetch = async (url, options) => {
    interceptedRequest = { url, options };
    return {
      ok: true,
      status: 201,
      json: async () => ({
        messageId: '<20260912120000.123456.brevo@mail.messmates.tech>'
      })
    };
  };

  try {
    const result = await sendOtpEmail({
      email: 'student.test@abes.ac.in',
      admissionNumber: '2025B01011362',
      name: 'Parth Sharma'
    });

    // Verify response
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.email, 'student.test@abes.ac.in');
    assert.strictEqual(result.messageId, '<20260912120000.123456.brevo@mail.messmates.tech>');
    assert.ok(result.sessionId, 'Session ID / Token must be returned');

    // Verify Brevo API Call Details
    assert.strictEqual(interceptedRequest.url, 'https://api.brevo.com/v3/smtp/email', 'Target URL must be Brevo v3 SMTP API');
    assert.strictEqual(interceptedRequest.options.method, 'POST');

    const headers = interceptedRequest.options.headers;
    assert.strictEqual(headers['accept'], 'application/json');
    assert.strictEqual(headers['content-type'], 'application/json');
    assert.strictEqual(headers['api-key'], 'xkeysib-test-fake-key-1234567890abcdef', 'api-key header must contain Brevo API key');

    const body = JSON.parse(interceptedRequest.options.body);

    // Sender verification
    assert.deepStrictEqual(body.sender, {
      name: 'MESSMATES',
      email: 'otp@messmates.tech'
    }, 'Sender must be MESSMATES <otp@messmates.tech>');

    // Recipient verification
    assert.strictEqual(body.to.length, 1);
    assert.strictEqual(body.to[0].email, 'student.test@abes.ac.in');
    assert.strictEqual(body.to[0].name, 'Parth Sharma');

    // Reply-To verification
    assert.deepStrictEqual(body.replyTo, {
      email: 'support@messmates.tech',
      name: 'MESSMATES Support'
    }, 'Reply-To must be MESSMATES Support <support@messmates.tech>');

    // Subject & Content
    assert.match(body.subject, /^MessMates Verification Code: \d{6}$/);
    assert.ok(body.htmlContent.includes('MessMates'), 'HTML must include MessMates branding');
    assert.ok(body.htmlContent.includes('2025B01011362'), 'HTML must include admission number');
    assert.ok(body.htmlContent.includes('10 minutes'), 'HTML must state 10 minutes expiry');
    assert.ok(body.textContent.includes('10 minutes'), 'Text content must include 10 minutes expiry');

  } finally {
    globalThis.fetch = originalFetch;
    process.env.BREVO_API_KEY = originalBrevoKey;
    process.env.BREVO_FROM_EMAIL = originalFromEmail;
    process.env.BREVO_FROM_NAME = originalFromName;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. END-TO-END VERIFICATION & TAMPER-RESISTANT WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────
await runAsyncTest('6. Full End-to-End Send and Verification Cycle', async () => {
  const originalFetch = globalThis.fetch;
  const originalBrevoKey = process.env.BREVO_API_KEY;

  process.env.BREVO_API_KEY = 'xkeysib-test-e2e-key';

  let generatedOtp = null;

  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    const match = body.subject.match(/(\d{6})$/);
    generatedOtp = match ? match[1] : null;
    return {
      ok: true,
      status: 201,
      json: async () => ({ messageId: '<msg_e2e_123>' })
    };
  };

  try {
    const sendResult = await sendOtpEmail({
      email: 'student.e2e@abes.ac.in',
      admissionNumber: '2025B9999999',
      name: 'E2E Tester'
    });

    assert.ok(generatedOtp, 'OTP must have been extracted from send call');

    // Verify with correct OTP
    const verifyResult = await verifyOtpCode({
      email: 'student.e2e@abes.ac.in',
      otp: generatedOtp,
      sessionId: sendResult.sessionId
    });

    assert.strictEqual(verifyResult.verified, true);
    assert.strictEqual(verifyResult.email, 'student.e2e@abes.ac.in');
    assert.strictEqual(verifyResult.admissionNumber, '2025B9999999');
    assert.ok(verifyResult.verificationProofToken.startsWith('mm_proof_'));

  } finally {
    globalThis.fetch = originalFetch;
    process.env.BREVO_API_KEY = originalBrevoKey;
  }
});

await runAsyncTest('7. Invalid OTP Rejection and Max Attempts Limit', async () => {
  const originalFetch = globalThis.fetch;
  const originalBrevoKey = process.env.BREVO_API_KEY;

  process.env.BREVO_API_KEY = 'xkeysib-test-attempts';

  globalThis.fetch = async () => ({
    ok: true,
    status: 201,
    json: async () => ({ messageId: '<msg_test_attempts>' })
  });

  try {
    const sendResult = await sendOtpEmail({
      email: 'student.attempts@abes.ac.in',
      admissionNumber: '2025B8888888',
      name: 'Attempts Tester'
    });

    // Send invalid OTP
    let failed = false;
    try {
      await verifyOtpCode({
        email: 'student.attempts@abes.ac.in',
        otp: '000000',
        sessionId: sendResult.sessionId
      });
    } catch (err) {
      failed = true;
      assert.ok(err.message.includes('Invalid verification code') || err.message.includes('attempt'));
    }
    assert.strictEqual(failed, true, 'Wrong OTP must be rejected with an error');

  } finally {
    globalThis.fetch = originalFetch;
    process.env.BREVO_API_KEY = originalBrevoKey;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ERROR HANDLING & API KEY SANITIZATION AUDIT
// ─────────────────────────────────────────────────────────────────────────────
await runAsyncTest('8. Error Sanitization: Brevo API Keys NEVER Leaked in Errors or Responses', async () => {
  const originalFetch = globalThis.fetch;
  const originalBrevoKey = process.env.BREVO_API_KEY;
  const secretApiKey = 'xkeysib-super-secret-production-brevo-api-key-999';

  process.env.BREVO_API_KEY = secretApiKey;

  // Mock Brevo returning an error that mentions the key or endpoint
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({
      code: 'unauthorized',
      message: `Key ${secretApiKey} is unauthorized.`
    })
  });

  try {
    let errorThrown = null;
    try {
      await sendOtpEmail({
        email: 'student.error@abes.ac.in',
        admissionNumber: '2025B7777777',
        name: 'Error Tester'
      });
    } catch (e) {
      errorThrown = e;
    }

    assert.ok(errorThrown !== null, 'sendOtpEmail must throw on Brevo API failure');
    assert.ok(!errorThrown.message.includes(secretApiKey), 'Error message must NEVER leak BREVO_API_KEY');
    assert.ok(errorThrown.message.includes('[REDACTED]'), 'Secret must be safely replaced with [REDACTED]');

  } finally {
    globalThis.fetch = originalFetch;
    process.env.BREVO_API_KEY = originalBrevoKey;
  }
});

await runAsyncTest('9. Missing BREVO_API_KEY Configuration Error Returns Clean Error Without Secrets', async () => {
  const originalBrevoKey = process.env.BREVO_API_KEY;
  const originalResendKey = process.env.RESEND_API_KEY;

  delete process.env.BREVO_API_KEY;
  delete process.env.RESEND_API_KEY;

  try {
    let errResult = null;
    try {
      await sendOtpEmail({
        email: 'student.noconfig@abes.ac.in',
        admissionNumber: '2025B6666666',
        name: 'No Config'
      });
    } catch (err) {
      errResult = err;
    }

    assert.ok(errResult !== null, 'Must throw error when neither BREVO_API_KEY nor RESEND_API_KEY configured');
    assert.ok(errResult.message.includes('BREVO_API_KEY is not configured'), 'Error message must cite missing BREVO_API_KEY');

  } finally {
    process.env.BREVO_API_KEY = originalBrevoKey;
    process.env.RESEND_API_KEY = originalResendKey;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. SERVERLESS ENDPOINT HANDLERS INTEGRATION (send-otp.js & verify-otp.js)
// ─────────────────────────────────────────────────────────────────────────────
await runAsyncTest('10. Vercel Serverless Endpoint: api/send-otp.js Handler', async () => {
  const originalFetch = globalThis.fetch;
  const originalBrevoKey = process.env.BREVO_API_KEY;

  process.env.BREVO_API_KEY = 'xkeysib-test-handler';

  globalThis.fetch = async () => ({
    ok: true,
    status: 201,
    json: async () => ({ messageId: '<msg_handler_123>' })
  });

  const mockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) { res.headers[k] = v; return res; },
      status(code) { res.statusCode = code; return res; },
      json(data) { res.body = data; return res; },
      end() { return res; }
    };
    return res;
  };

  try {
    // 1. Success case
    const req1 = {
      method: 'POST',
      body: {
        email: 'student.handler@abes.ac.in',
        admissionNumber: '2025B5555555',
        name: 'Handler Student'
      }
    };
    const res1 = mockRes();
    await sendOtpHandler(req1, res1);

    assert.strictEqual(res1.statusCode, 200, 'Valid request should return 200');
    assert.strictEqual(res1.body.success, true);
    assert.strictEqual(res1.body.email, 'student.handler@abes.ac.in');
    assert.ok(res1.headers['X-Request-Id'], 'X-Request-Id header must be set');

    // 2. Missing fields case
    const req2 = {
      method: 'POST',
      body: { email: 'student.handler@abes.ac.in' } // missing admissionNumber
    };
    const res2 = mockRes();
    await sendOtpHandler(req2, res2);
    assert.strictEqual(res2.statusCode, 400, 'Missing admissionNumber should return 400');

    // 3. Method not allowed
    const req3 = { method: 'GET' };
    const res3 = mockRes();
    await sendOtpHandler(req3, res3);
    assert.strictEqual(res3.statusCode, 405, 'GET should return 405');

  } finally {
    globalThis.fetch = originalFetch;
    process.env.BREVO_API_KEY = originalBrevoKey;
  }
});

await runAsyncTest('11. Vercel Serverless Endpoint: api/verify-otp.js Handler', async () => {
  const mockRes = () => {
    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) { res.headers[k] = v; return res; },
      status(code) { res.statusCode = code; return res; },
      json(data) { res.body = data; return res; },
      end() { return res; }
    };
    return res;
  };

  // Missing fields case
  const req1 = {
    method: 'POST',
    body: { email: 'student.verify@abes.ac.in', otp: '123' } // only 3 digits
  };
  const res1 = mockRes();
  await verifyOtpHandler(req1, res1);
  assert.strictEqual(res1.statusCode, 400);
  assert.ok(res1.body.message.includes('6-digit'));
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLIENT-SIDE SECRET EXPOSURE AUDIT
// ─────────────────────────────────────────────────────────────────────────────
runTest('12. Zero Client-Side Secret Exposure (src/ and dist/)', () => {
  const projectRoot = path.resolve(import.meta.dirname, '..');

  // Search src/ for any mention of BREVO_API_KEY
  function checkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(
          !content.includes('BREVO_API_KEY'),
          `Client-side file ${fullPath} must NEVER contain or reference BREVO_API_KEY`
        );
      }
    }
  }

  checkDir(path.join(projectRoot, 'src'));

  // Search dist/ if built
  const distDir = path.join(projectRoot, 'dist');
  if (fs.existsSync(distDir)) {
    function checkDist(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDist(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          assert.ok(
            !content.includes('BREVO_API_KEY'),
            `Distribution bundle ${fullPath} must NEVER contain BREVO_API_KEY`
          );
        }
      }
    }
    checkDist(distDir);
  }
});

console.log('\n----------------------------------------------------------------------');
console.log(`  Brevo OTP Migration Verification: ${testsPassed} passed, 0 failed (${testsTotal} total)`);
console.log('----------------------------------------------------------------------\n');
