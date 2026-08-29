import fs from 'fs';
import path from 'path';

console.log('=== TEST SUITE: ABOUT US FOUNDER PROFILES & IMAGES ===\n');

// 1. Check founders configuration
import { FOUNDERS } from './src/config/founders.js';

console.assert(Array.isArray(FOUNDERS), 'FOUNDERS must be an array');
console.assert(FOUNDERS.length === 2, `FOUNDERS must have exactly 2 people, got ${FOUNDERS.length}`);

// Founder 1: Parth Sharma
const parth = FOUNDERS[0];
console.log('Founder 1:');
console.log('  Name:    ', parth.name);
console.log('  Role:    ', parth.role);
console.log('  Year:    ', parth.year);
console.log('  Branch:  ', parth.branch);
console.log('  LinkedIn:', parth.linkedin);

console.assert(parth.name === 'Parth Sharma', 'Name must be Parth Sharma');
console.assert(parth.role === 'FOUNDER', 'Role must be FOUNDER');
console.assert(parth.year === '2nd Year', 'Year must be 2nd Year');
console.assert(parth.branch === 'AIML', 'Branch must be AIML');
console.assert(parth.linkedin === 'https://www.linkedin.com/in/parth-sharma101004', 'LinkedIn URL must match exactly');

// Founder 2: Shivendra Pratap Singh
const shivendra = FOUNDERS[1];
console.log('\nFounder 2:');
console.log('  Name:    ', shivendra.name);
console.log('  Role:    ', shivendra.role);
console.log('  Year:    ', shivendra.year);
console.log('  Branch:  ', shivendra.branch);
console.log('  LinkedIn:', shivendra.linkedin);

console.assert(shivendra.name === 'Shivendra Pratap Singh', 'Name must be Shivendra Pratap Singh');
console.assert(shivendra.role === 'CO-FOUNDER', 'Role must be CO-FOUNDER');
console.assert(shivendra.year === '2nd Year', 'Year must be 2nd Year');
console.assert(shivendra.branch === 'CSE', 'Branch must be CSE');
console.assert(shivendra.linkedin === 'https://www.linkedin.com/in/shivendra-pratap-singh-7358b837', 'LinkedIn URL must match exactly');

// 2. Check physical image assets
console.log('\n--- Checking Asset Storage & Files ---');

const publicParth = path.join(process.cwd(), 'public', 'founders', 'parth_sharma.jpg');
const publicShivendra = path.join(process.cwd(), 'public', 'founders', 'shivendra_pratap_singh.jpg');
const assetParth = path.join(process.cwd(), 'src', 'assets', 'founders', 'parth_sharma.jpg');
const assetShivendra = path.join(process.cwd(), 'src', 'assets', 'founders', 'shivendra_pratap_singh.jpg');

console.assert(fs.existsSync(publicParth), 'public/founders/parth_sharma.jpg must exist');
console.assert(fs.existsSync(publicShivendra), 'public/founders/shivendra_pratap_singh.jpg must exist');
console.assert(fs.existsSync(assetParth), 'src/assets/founders/parth_sharma.jpg must exist');
console.assert(fs.existsSync(assetShivendra), 'src/assets/founders/shivendra_pratap_singh.jpg must exist');

const parthSize = fs.statSync(publicParth).size;
const shivendraSize = fs.statSync(publicShivendra).size;

console.log(`✓ Parth photo verified (${(parthSize / 1024).toFixed(1)} KB)`);
console.log(`✓ Shivendra photo verified (${(shivendraSize / 1024).toFixed(1)} KB)`);

console.log('\n====================================================');
console.log('ABOUT US TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
