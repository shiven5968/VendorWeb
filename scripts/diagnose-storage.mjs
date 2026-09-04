#!/usr/bin/env node
/**
 * MessMates — Storage Diagnostic Script
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { Storage } from '@google-cloud/storage';
import { OAuth2Client } from 'google-auth-library';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TARGET_PROJECT_ID = 'messmates-f69a3';
const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyARw4CyvhbiItVCC4HiKvaR-N8a1nmi3JU',
  authDomain: 'messmates-f69a3.firebaseapp.com',
  projectId: TARGET_PROJECT_ID,
  storageBucket: 'messmates-f69a3.firebasestorage.app',
  appId: '1:39348747656:web:8e5b4170ebb25ae2978e3d'
};

function getCredentials() {
  const p = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (fs.existsSync(p)) {
    try {
      const config = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (config.tokens?.access_token) {
        return { type: 'oauth', accessToken: config.tokens.access_token };
      }
    } catch (e) {}
  }
  return null;
}

async function main() {
  console.log('================================================================');
  console.log(' MESSMATES — FIREBASE CLOUD STORAGE DIAGNOSTIC');
  console.log('================================================================');
  console.log('Project ID:     ', TARGET_PROJECT_ID);
  console.log('Configured Bucket:', FIREBASE_CONFIG.storageBucket);

  const creds = getCredentials();
  if (creds) {
    const authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: creds.accessToken });
    const gcs = new Storage({ projectId: TARGET_PROJECT_ID, authClient });

    console.log('\n1. Checking Google Cloud Storage Buckets for project...');
    try {
      const [buckets] = await gcs.getBuckets();
      console.log(`   Found ${buckets.length} bucket(s):`);
      buckets.forEach(b => console.log(`   - ${b.name} (location: ${b.metadata.location}, storageClass: ${b.metadata.storageClass})`));
      
      if (buckets.length === 0) {
        console.log('   ❌ No buckets found in Google Cloud Storage for this project!');
      }
    } catch (e) {
      console.log('   ❌ Error querying buckets via GCS API:', e.message);
      if (e.errors) console.log('   Errors detail:', e.errors);
    }
  }

  console.log('\n2. Testing Firebase Web SDK upload attempt directly...');
  const app = initializeApp(FIREBASE_CONFIG, 'storage-test-' + Date.now());
  const storage = getStorage(app);
  console.log('   Storage instance initialized:', Boolean(storage));
  console.log('   Bucket on instance:', storage.app.options.storageBucket);

  const dummyData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
  const testRef = ref(storage, `test-diagnostics/test_${Date.now()}.jpg`);
  
  try {
    const uploadRes = await uploadBytes(testRef, dummyData, { contentType: 'image/jpeg' });
    console.log('   ✓ Upload succeeded:', uploadRes.ref.fullPath);
    const downloadUrl = await getDownloadURL(uploadRes.ref);
    console.log('   ✓ Download URL obtained:', downloadUrl);
  } catch (err) {
    console.log('   ❌ Web SDK upload failed!');
    console.log('   Error Code:   ', err.code);
    console.log('   Error Message:', err.message);
    console.log('   Server Response:', err.customData?.serverResponse);
  }

  // Also check appspot.com variant bucket
  console.log('\n3. Testing appspot.com legacy bucket naming variant...');
  const app2 = initializeApp({ ...FIREBASE_CONFIG, storageBucket: 'messmates-f69a3.appspot.com' }, 'storage-test-2-' + Date.now());
  const storage2 = getStorage(app2);
  const testRef2 = ref(storage2, `test-diagnostics/test_${Date.now()}.jpg`);
  try {
    const uploadRes2 = await uploadBytes(testRef2, dummyData, { contentType: 'image/jpeg' });
    console.log('   ✓ Upload succeeded on appspot.com:', uploadRes2.ref.fullPath);
  } catch (err) {
    console.log('   ❌ Web SDK upload to appspot.com failed:');
    console.log('   Error Code:   ', err.code);
    console.log('   Error Message:', err.message);
    console.log('   Server Response:', err.customData?.serverResponse);
  }

  console.log('================================================================\n');
}

main().catch(console.error);
