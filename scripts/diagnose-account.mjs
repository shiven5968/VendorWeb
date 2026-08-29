#!/usr/bin/env node
/**
 * MessMates — Admin Account Diagnostic & Recovery Tool
 * =====================================================
 * Safe diagnostic utility for warden/dev use only.
 *
 * Usage:
 *   node scripts/diagnose-account.mjs --admission=2400320106436
 *   node scripts/diagnose-account.mjs --email=student@abes.ac.in
 *   node scripts/diagnose-account.mjs --admission=2400320106436 --repair
 *
 * Requirements:
 *   - FIREBASE_SERVICE_ACCOUNT_KEY env var (or FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL)
 *   - Run from project root
 *
 * NEVER:
 *   - bulk-deletes
 *   - auto-repairs ambiguous identity conflicts
 *   - modifies auth credentials
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ── Firebase Admin Init ─────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) {
    const { getFirestore } = await import('firebase-admin/firestore').catch(() => ({}));
    return;
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID ||
                    process.env.FIREBASE_PROJECT_ID ||
                    'messmates-f69a3';

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    let sa = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (typeof sa === 'string') sa = JSON.parse(sa);
    initializeApp({ credential: cert(sa), projectId });
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      projectId
    });
  } else {
    throw new Error(
      'No Firebase Admin credentials found. Set FIREBASE_SERVICE_ACCOUNT_KEY or ' +
      'FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL environment variables.'
    );
  }
}

// ── Normalization ──────────────────────────────────────────────────────────

const normalizeAdmission = (s) => (s || '').trim().toUpperCase();
const normalizeEmail = (s) => (s || '').trim().toLowerCase();

// ── Diagnostic Logic ───────────────────────────────────────────────────────

async function diagnose({ admissionNumber, email, repair = false }) {
  initAdmin();
  const db = getFirestore();
  const adminAuth = getAuth();

  const canonicalAdmission = admissionNumber ? normalizeAdmission(admissionNumber) : null;
  const canonicalEmail = email ? normalizeEmail(email) : null;

  const report = {
    input: { admissionNumber: canonicalAdmission, email: canonicalEmail },
    admissionMapExists: false,
    mapData: null,
    authUserExists: false,
    authUid: null,
    authEmail: null,
    userDocExists: false,
    userDocData: null,
    mapUidMatch: null,
    mapEmailMatch: null,
    profileAdmissionMatch: null,
    issues: [],
    repairsPerformed: [],
    status: 'UNKNOWN'
  };

  // ── Step 1: Look up admission_map ────────────────────────────────────────
  if (canonicalAdmission) {
    try {
      const mapSnap = await db.collection('admission_map').doc(canonicalAdmission).get();
      report.admissionMapExists = mapSnap.exists;
      if (mapSnap.exists) {
        report.mapData = mapSnap.data();
        report.authUid = report.mapData.uid;
        if (canonicalEmail) {
          report.mapEmailMatch =
            normalizeEmail(report.mapData.email) === canonicalEmail;
          if (!report.mapEmailMatch) {
            report.issues.push(
              `admission_map email (${report.mapData.email}) does not match provided email (${canonicalEmail})`
            );
          }
        }
      } else {
        report.issues.push(`No admission_map entry found for "${canonicalAdmission}"`);
      }
    } catch (e) {
      report.issues.push('admission_map read error: ' + e.message);
    }
  }

  // ── Step 2: Resolve UID for email if no admission map ─────────────────────
  if (!report.authUid && canonicalEmail) {
    try {
      const userByEmail = await adminAuth.getUserByEmail(canonicalEmail);
      report.authUid = userByEmail.uid;
      report.authEmail = userByEmail.email;
      report.authUserExists = true;
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        report.issues.push('Auth lookup by email error: ' + e.message);
      }
    }
  }

  // ── Step 3: Verify Auth user by UID ──────────────────────────────────────
  if (report.authUid && !report.authUserExists) {
    try {
      const authUser = await adminAuth.getUser(report.authUid);
      report.authUserExists = true;
      report.authEmail = authUser.email;
      if (canonicalEmail && normalizeEmail(authUser.email) !== canonicalEmail) {
        report.issues.push(
          `Auth email (${authUser.email}) does not match provided email (${canonicalEmail})`
        );
      }
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        report.authUserExists = false;
        report.issues.push('Auth user not found for UID: ' + report.authUid);
      } else {
        report.issues.push('Auth UID lookup error: ' + e.message);
      }
    }
  }

  // ── Step 4: Read users/{uid} document ────────────────────────────────────
  if (report.authUid) {
    try {
      const userSnap = await db.collection('users').doc(report.authUid).get();
      report.userDocExists = userSnap.exists;
      if (userSnap.exists) {
        report.userDocData = userSnap.data();
        // Check admission number consistency
        const profileAdmission = normalizeAdmission(report.userDocData.admissionNumber || '');
        if (canonicalAdmission) {
          report.profileAdmissionMatch = profileAdmission === canonicalAdmission;
          if (!report.profileAdmissionMatch) {
            report.issues.push(
              `users/{uid} admissionNumber (${profileAdmission}) does not match ` +
              `admission_map key (${canonicalAdmission})`
            );
          }
        }
        report.mapUidMatch = report.mapData ? report.mapData.uid === report.authUid : null;
      } else {
        report.issues.push(`users/${report.authUid} document missing`);
      }
    } catch (e) {
      report.issues.push('users/{uid} read error: ' + e.message);
    }
  }

  // ── Step 5: Determine status ─────────────────────────────────────────────
  const critical = report.issues.length;
  if (critical === 0 &&
      report.authUserExists &&
      report.userDocExists &&
      report.admissionMapExists) {
    report.status = 'HEALTHY';
  } else if (report.authUserExists && (report.userDocExists || report.admissionMapExists)) {
    report.status = 'INCOMPLETE';
  } else {
    report.status = 'INCONSISTENT';
  }

  // ── Step 6: Safe Repair (only if --repair flag and unambiguous) ──────────
  if (repair && report.status !== 'HEALTHY') {
    if (!report.authUserExists) {
      console.error('[REPAIR SKIPPED] No valid Auth user found — cannot auto-repair.');
    } else if (report.issues.some(i =>
      i.includes('does not match') && !i.includes('missing')
    )) {
      console.error(
        '[REPAIR SKIPPED] Conflicting data detected — manual investigation required.'
      );
    } else {
      // Safe repairs only: fill in missing documents
      const uid = report.authUid;
      const repairEmail = report.authEmail || canonicalEmail;
      const repairAdmission = canonicalAdmission ||
        normalizeAdmission(report.userDocData?.admissionNumber || '');

      if (!report.userDocExists && repairEmail && repairAdmission) {
        const newProfile = {
          uid,
          name: report.userDocData?.name || repairEmail.split('@')[0],
          email: repairEmail,
          admissionNumber: repairAdmission,
          role: 'student',
          hostelBlock: 'DNB Block',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _repairedAt: new Date().toISOString(),
          _repairedBy: 'admin-diagnostic-tool'
        };
        await db.collection('users').doc(uid).set(newProfile, { merge: true });
        report.repairsPerformed.push('Created missing users/{uid} document');
        report.userDocData = newProfile;
        report.userDocExists = true;
      }

      if (!report.admissionMapExists && repairAdmission && repairEmail) {
        await db.collection('admission_map').doc(repairAdmission).set({
          admissionNumber: repairAdmission,
          email: repairEmail,
          uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _repairedAt: new Date().toISOString(),
          _repairedBy: 'admin-diagnostic-tool'
        }, { merge: true });
        report.repairsPerformed.push('Created missing admission_map entry');
        report.admissionMapExists = true;
      }

      if (report.repairsPerformed.length > 0) {
        report.status = 'REPAIRED';
      }
    }
  }

  return report;
}

// ── CLI Entry ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (key) => {
  const found = args.find(a => a.startsWith(`--${key}=`));
  return found ? found.split('=')[1] : null;
};

const admissionNumber = getArg('admission');
const email = getArg('email');
const repair = args.includes('--repair');

if (!admissionNumber && !email) {
  console.error('Usage: node scripts/diagnose-account.mjs --admission=<number> [--email=<email>] [--repair]');
  process.exit(1);
}

diagnose({ admissionNumber, email, repair })
  .then(report => {
    console.log('\n══════════════════════════════════════════');
    console.log('  MessMates Account Diagnostic Report');
    console.log('══════════════════════════════════════════');
    console.log('Input:', report.input);
    console.log('');
    console.log('Auth User Exists   :', report.authUserExists);
    console.log('Auth UID           :', report.authUid || '(none)');
    console.log('users/{uid} Exists :', report.userDocExists);
    console.log('admission_map Exists:', report.admissionMapExists);
    console.log('Map UID Match      :', report.mapUidMatch);
    console.log('Map Email Match    :', report.mapEmailMatch);
    console.log('Profile Adm Match  :', report.profileAdmissionMatch);
    console.log('');
    console.log('Issues:', report.issues.length === 0 ? 'None' : '');
    report.issues.forEach(i => console.log(' ⚠', i));
    if (report.repairsPerformed.length > 0) {
      console.log('\nRepairs performed:');
      report.repairsPerformed.forEach(r => console.log(' ✓', r));
    }
    console.log('');
    const statusEmoji = {
      HEALTHY: '✅',
      INCOMPLETE: '⚠️',
      INCONSISTENT: '❌',
      REPAIRED: '🔧',
      UNKNOWN: '❓'
    };
    console.log(`STATUS: ${statusEmoji[report.status] || ''} ${report.status}`);
    console.log('══════════════════════════════════════════\n');
  })
  .catch(err => {
    console.error('Diagnostic failed:', err.message);
    process.exit(1);
  });
