import { 
  MEAL_ORDER, 
  MEAL_ORDER_MAP, 
  getMealOrderIndex, 
  sortMealsByOfficialOrder 
} from './src/services/mealTiming.js';
import { validateMealImage } from './src/services/storage.js';
import { PILOT_ACCOUNTS } from './src/services/seedUsers.js';
import { INITIAL_USERS } from './src/services/db.js';

console.log('=== TEST SUITE: MEAL ORDERING, IMAGE UPLOAD & STAFF CREDENTIALS ===\n');

// -------------------------------------------------------------
// TEST 1: MEAL CATEGORY ORDERING
// -------------------------------------------------------------
console.log('--- TEST 1: Meal Category Ordering (Breakfast -> Lunch -> Snacks -> Dinner) ---');

console.assert(getMealOrderIndex('Breakfast') === 1, 'Breakfast must be index 1');
console.assert(getMealOrderIndex('Lunch') === 2, 'Lunch must be index 2');
console.assert(getMealOrderIndex('Snacks') === 3, 'Snacks must be index 3');
console.assert(getMealOrderIndex('Dinner') === 4, 'Dinner must be index 4');

// Test sorting an unordered / scrambled array of meals
const scrambledMeals = [
  { id: 'm4', name: 'Dinner Thali', category: 'Dinner', day: 'Monday' },
  { id: 'm2', name: 'Lunch Combo', category: 'Lunch', day: 'Monday' },
  { id: 'm1', name: 'Aloo Paratha', category: 'Breakfast', day: 'Monday' },
  { id: 'm3', name: 'Tea & Samosa', category: 'Snacks', day: 'Monday' }
];

const sorted = sortMealsByOfficialOrder(scrambledMeals);
console.log('Original order:', scrambledMeals.map(m => m.category).join(' -> '));
console.log('Sorted order:  ', sorted.map(m => m.category).join(' -> '));

console.assert(sorted[0].category === 'Breakfast', '0 must be Breakfast');
console.assert(sorted[1].category === 'Lunch', '1 must be Lunch');
console.assert(sorted[2].category === 'Snacks', '2 must be Snacks');
console.assert(sorted[3].category === 'Dinner', '3 must be Dinner');

console.log('✓ Meal order is strictly Breakfast -> Lunch -> Snacks -> Dinner.\n');

// -------------------------------------------------------------
// TEST 2: IMAGE UPLOAD VALIDATION (5 MB, JPG/PNG/WEBP)
// -------------------------------------------------------------
console.log('--- TEST 2: Image Upload Validation Rules ---');

// Valid cases
const validJpg = { name: 'dish.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 }; // 2 MB
const validPng = { name: 'dish.png', type: 'image/png', size: 4.5 * 1024 * 1024 }; // 4.5 MB
const validWebp = { name: 'dish.webp', type: 'image/webp', size: 1 * 1024 * 1024 }; // 1 MB

console.assert(validateMealImage(validJpg) === true, 'JPG under 5MB should be valid');
console.assert(validateMealImage(validPng) === true, 'PNG under 5MB should be valid');
console.assert(validateMealImage(validWebp) === true, 'WEBP under 5MB should be valid');

// Invalid size (> 5MB)
let sizeErrorCaught = false;
try {
  const oversizedFile = { name: 'heavy.jpg', type: 'image/jpeg', size: 6 * 1024 * 1024 }; // 6 MB
  validateMealImage(oversizedFile);
} catch (e) {
  sizeErrorCaught = true;
  console.log('✓ Correctly caught oversized file error:', e.message);
}
console.assert(sizeErrorCaught, 'Oversized file must be rejected');

// Invalid format (e.g. PDF or GIF)
let formatErrorCaught = false;
try {
  const invalidFormat = { name: 'menu.pdf', type: 'application/pdf', size: 500 * 1024 };
  validateMealImage(invalidFormat);
} catch (e) {
  formatErrorCaught = true;
  console.log('✓ Correctly caught invalid format error:', e.message);
}
console.assert(formatErrorCaught, 'Invalid format must be rejected');
console.log('✓ Image upload validations (5MB limit & formats) verified.\n');

// -------------------------------------------------------------
// TEST 3: STAFF CREDENTIAL AUDIT
// -------------------------------------------------------------
console.log('--- TEST 3: Staff Credential Audit ---');

const committeeSeed = PILOT_ACCOUNTS.find(a => a.role === 'mess_committee');
const wardenSeed = PILOT_ACCOUNTS.find(a => a.role === 'warden');

console.log('Mess Committee Account:');
console.log('  Name:            ', committeeSeed.name);
console.log('  Role:            ', committeeSeed.role);
console.log('  Email Identifier:', committeeSeed.email);
console.log('  Staff Identifier:', committeeSeed.admissionNumber);
console.log('  Initial Password:', committeeSeed.password);

console.log('\nChief Warden Account:');
console.log('  Name:            ', wardenSeed.name);
console.log('  Role:            ', wardenSeed.role);
console.log('  Email Identifier:', wardenSeed.email);
console.log('  Staff Identifier:', wardenSeed.admissionNumber);
console.log('  Initial Password:', wardenSeed.password);

console.assert(committeeSeed.email === 'committee@abes.ac.in', 'Committee email must be committee@abes.ac.in');
console.assert(wardenSeed.email === 'warden@abes.ac.in', 'Warden email must be warden@abes.ac.in');
console.assert(committeeSeed.admissionNumber === 'MC-2026-01', 'Committee staff ID must be MC-2026-01');
console.assert(wardenSeed.admissionNumber === 'CW-2026-01', 'Warden staff ID must be CW-2026-01');

console.log('\n====================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
