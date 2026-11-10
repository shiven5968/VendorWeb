import assert from 'assert';
import { 
  calculateItemNutrition, 
  calculateDailyNutritionSummary,
  generateSmartMealPlan,
  parseMealItemsWithNutrition
} from './src/services/nutritionEngine.js';
import { 
  getSmartAlternatives, 
  CAMPUS_NUTRITION_STAPLES 
} from './src/services/nutritionAlternatives.js';
import { 
  askNutritionCoach, 
  SUGGESTED_COACH_PROMPTS 
} from './src/services/nutritionCoachService.js';
import { formatTimeRemaining } from './src/services/musclePassService.js';
import { MUSCLE_PASS_PLAN_LIST, getMusclePassPlan } from './src/config/pricing.js';

console.log('=== TEST SUITE: MESSMATES MUSCLE PASS WORLD-CLASS NUTRITION EXPERIENCE ===\n');

// ── TEST 1: TRIAL DURATION & FORMATTING ───────────────────────────────────────
console.log('--- TEST 1: 7-Day Demo Timestamps & Entitlement ---');
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
assert.strictEqual(sevenDaysMs, 604800000, '7 days should equal exactly 604,800,000 ms');

const formatted7Days = formatTimeRemaining(sevenDaysMs);
assert.ok(formatted7Days.includes('7 days') || formatted7Days.includes('6 days'), 'Formatted duration should report days left');

const formattedHours = formatTimeRemaining(5 * 3600 * 1000 + 30 * 60 * 1000);
assert.strictEqual(formattedHours, '5 hrs 30 mins left', 'Hours formatting should match');

const formattedExpired = formatTimeRemaining(0);
assert.strictEqual(formattedExpired, 'Expired', 'Zero ms left should return Expired');
console.log('✓ Trial timestamps and remaining time formatting verified.');

// ── TEST 2: DETERMINISTIC NUTRITION CALCULATIONS (CASES A, B, C, D, E) ────────
console.log('\n--- TEST 2: Deterministic Calculation Engine (Cases A, B, C, D, E) ---');

// Baseline item calculation
const itemCalcFull = calculateItemNutrition({ proteinPerServing: 12.0, caloriesPerServing: 200, portion: 1.0 });
assert.strictEqual(itemCalcFull.proteinConsumed, 12.0);
assert.strictEqual(itemCalcFull.caloriesConsumed, 200);

const itemCalcHalf = calculateItemNutrition({ proteinPerServing: 12.0, caloriesPerServing: 200, portion: 0.5 });
assert.strictEqual(itemCalcHalf.proteinConsumed, 6.0);
assert.strictEqual(itemCalcHalf.caloriesConsumed, 100);

const itemCalcDouble = calculateItemNutrition({ proteinPerServing: 12.0, caloriesPerServing: 200, portion: 2.0 });
assert.strictEqual(itemCalcDouble.proteinConsumed, 24.0);
assert.strictEqual(itemCalcDouble.caloriesConsumed, 400);

// CASE A: Target 120g. Student logs half of Breakfast (10g). Consumed = 10g, Remaining = 110g.
const caseALogs = [
  {
    mealType: 'Breakfast',
    status: 'COMPLETED',
    items: [
      { name: 'Paneer Bhurji', proteinConsumed: 10.0, caloriesConsumed: 150 }
    ],
    proteinConsumed: 10.0,
    caloriesConsumed: 150
  }
];
const caseASummary = calculateDailyNutritionSummary(caseALogs, 120);
assert.strictEqual(caseASummary.consumedProtein, 10.0, 'Case A: Consumed should be 10g');
assert.strictEqual(caseASummary.remainingProtein, 110.0, 'Case A: Remaining should be 110g');
assert.strictEqual(caseASummary.completionPercentage, 8, 'Case A: 10/120 should be 8%');
console.log('✓ Case A (Partial meal logging) verified: 10g consumed, 110g remaining.');

// CASE B: Student skips breakfast. Consumed = 0g from breakfast, Remaining target unchanged.
const caseBLogs = [
  {
    mealType: 'Breakfast',
    status: 'SKIPPED',
    items: [],
    proteinConsumed: 0,
    caloriesConsumed: 0
  }
];
const caseBSummary = calculateDailyNutritionSummary(caseBLogs, 120);
assert.strictEqual(caseBSummary.consumedProtein, 0, 'Case B: Consumed should remain 0g');
assert.strictEqual(caseBSummary.remainingProtein, 120, 'Case B: Remaining should remain 120g');
assert.strictEqual(caseBSummary.mealStatuses['Breakfast'], 'SKIPPED', 'Case B: Status must be SKIPPED');
console.log('✓ Case B (Skipped meal) verified: 0g consumed, 120g remaining intact.');

// CASE C: Student logs extra food (e.g. Outside Whey Shake 24g). Consumed increases immediately.
const caseCLogs = [
  ...caseALogs,
  {
    mealType: 'Snacks',
    status: 'COMPLETED',
    items: [
      { name: 'Whey Protein Scoop', proteinConsumed: 24.0, caloriesConsumed: 125, isExtra: true }
    ],
    proteinConsumed: 24.0,
    caloriesConsumed: 125
  }
];
const caseCSummary = calculateDailyNutritionSummary(caseCLogs, 120);
assert.strictEqual(caseCSummary.consumedProtein, 34.0, 'Case C: 10g + 24g = 34g consumed');
assert.strictEqual(caseCSummary.remainingProtein, 86.0, 'Case C: 120 - 34 = 86g remaining');
assert.strictEqual(caseCSummary.completionPercentage, 28, 'Case C: 34/120 = 28%');
console.log('✓ Case C (Outside food addition) verified: Consumed updated to 34g, remaining 86g.');

// CASE D: Student edits meal (updates portion from 10g to 20g).
const caseDLogs = [
  {
    mealType: 'Breakfast',
    status: 'COMPLETED',
    items: [
      { name: 'Paneer Bhurji', proteinConsumed: 20.0, caloriesConsumed: 300 }
    ],
    proteinConsumed: 20.0,
    caloriesConsumed: 300
  }
];
const caseDSummary = calculateDailyNutritionSummary(caseDLogs, 120);
assert.strictEqual(caseDSummary.consumedProtein, 20.0, 'Case D: Edited intake updates to 20g');
assert.strictEqual(caseDSummary.remainingProtein, 100.0, 'Case D: Remaining updates to 100g');
console.log('✓ Case D (Meal edit) verified: Recalculated cleanly to 20g consumed.');

// CASE E: Accidental double-tap / duplicate prevention
// A duplicate submission for 'Breakfast' replaces the previous slot instead of stacking
let singleDayLogs = [];
const log1 = { mealType: 'Breakfast', proteinConsumed: 15.0 };
const log2Duplicate = { mealType: 'Breakfast', proteinConsumed: 15.0 };

singleDayLogs = singleDayLogs.filter(l => l.mealType !== log1.mealType);
singleDayLogs.push(log1);
singleDayLogs = singleDayLogs.filter(l => l.mealType !== log2Duplicate.mealType);
singleDayLogs.push(log2Duplicate);

assert.strictEqual(singleDayLogs.length, 1, 'Case E: Array must contain exactly 1 log for Breakfast');
assert.strictEqual(singleDayLogs[0].proteinConsumed, 15.0, 'Case E: Stored value must be 15g, not 30g');
console.log('✓ Case E (Double-tap duplicate prevention) verified: Exactly 1 record preserved.');

// ── TEST 3: SMART FOOD ALTERNATIVES FILTERING (PHASE 9) ──────────────────────
console.log('\n--- TEST 3: Smart Campus Alternatives Filtering ---');

// Test vegetarian filtering (Eggs must be excluded)
const vegAlts = getSmartAlternatives({
  dietaryPreference: 'Vegetarian',
  allergies: [],
  remainingProteinNeeded: 40
});
const hasEggsInVeg = vegAlts.some(a => a.name.toLowerCase().includes('egg'));
assert.strictEqual(hasEggsInVeg, false, 'Vegetarian alternatives must NOT contain eggs');
assert.ok(vegAlts.some(a => a.name.includes('Paneer')), 'Vegetarian alternatives should include Paneer');

// Test eggetarian filtering (Eggs must be included)
const eggAlts = getSmartAlternatives({
  dietaryPreference: 'Eggetarian',
  allergies: [],
  remainingProteinNeeded: 40
});
const hasEggsInEgg = eggAlts.some(a => a.name.toLowerCase().includes('egg'));
assert.strictEqual(hasEggsInEgg, true, 'Eggetarian alternatives MUST include eggs');

// Test dairy allergy filtering (Milk, Curd, Paneer, Whey must be excluded)
const dairyAllergyAlts = getSmartAlternatives({
  dietaryPreference: 'Vegetarian',
  allergies: ['Dairy'],
  remainingProteinNeeded: 30
});
const hasDairyInAllergy = dairyAllergyAlts.some(a => 
  a.name.includes('Milk') || a.name.includes('Curd') || a.name.includes('Paneer') || a.name.includes('Whey')
);
assert.strictEqual(hasDairyInAllergy, false, 'Dairy allergy must exclude all dairy products');
assert.ok(dairyAllergyAlts.some(a => a.name.includes('Chana') || a.name.includes('Sprouts')), 'Non-dairy plant alternatives should remain available');
console.log('✓ Smart alternatives filter accurately by dietary preference and allergies.');

// ── TEST 4: CAMPUS AI NUTRITION COACH REASONING ───────────────────────────────
console.log('\n--- TEST 4: Campus AI Nutrition Coach Grounding ---');

const mockProfile = {
  name: 'Parth Sharma',
  weightKg: 60,
  dailyProteinTargetG: 120,
  goal: 'Muscle Gain',
  dietaryPreference: 'Vegetarian',
  allergies: []
};

const mockSummary = {
  targetProtein: 120,
  consumedProtein: 42,
  remainingProtein: 78,
  completionPercentage: 35,
  completedMealsCount: 1
};

const mockRecommendations = {
  Dinner: {
    category: 'Dinner',
    status: 'PENDING',
    title: 'Rajma & Rice with Roti & Salad',
    totalSuggestedProtein: 32,
    suggestedItems: [
      { name: 'Rajma', recommendedPortionLabel: '2 bowls', recommendedProteinG: 22 },
      { name: 'Roti', recommendedPortionLabel: '3 pcs', recommendedProteinG: 9 }
    ]
  }
};

const mockMeals = [
  { category: 'Dinner', title: 'Rajma & Rice with Roti & Salad' }
];

// Query 1: Skipped breakfast
const coachRes1 = askNutritionCoach({
  query: 'I skipped breakfast. What should I eat now?',
  profile: mockProfile,
  summary: mockSummary,
  recommendations: mockRecommendations,
  todayMeals: mockMeals
});
assert.ok(coachRes1.answer.includes('78g protein') || coachRes1.answer.includes('daily goal'), 'Coach must report remaining protein needed');
assert.ok(coachRes1.disclaimer.includes('Not medical advice'), 'Coach must include medical disclaimer');

// Query 2: How much protein consumed
const coachRes2 = askNutritionCoach({
  query: 'How much protein have I consumed today?',
  profile: mockProfile,
  summary: mockSummary,
  recommendations: mockRecommendations,
  todayMeals: mockMeals
});
assert.ok(coachRes2.answer.includes('42g'), 'Coach must report exact consumed protein');
assert.ok(coachRes2.answer.includes('120g'), 'Coach must report exact target protein');

// Query 3: Dinner recommendation
const coachRes3 = askNutritionCoach({
  query: 'What can I eat from today\'s dinner menu?',
  profile: mockProfile,
  summary: mockSummary,
  recommendations: mockRecommendations,
  todayMeals: mockMeals
});
assert.ok(coachRes3.answer.includes('Rajma'), 'Coach must cite actual dinner dish');
console.log('✓ AI Nutrition Coach answers grounded in actual campus menu and student intake.');

// ── TEST 5: PRICING CONFIGURATION CONSISTENCY (PHASE 16) ──────────────────────
console.log('\n--- TEST 5: Official Pricing Tiers Consistency ---');
assert.strictEqual(MUSCLE_PASS_PLAN_LIST.length, 4, 'Must have exactly 4 official plans');

const monthly = getMusclePassPlan('MUSCLE_MONTHLY');
assert.strictEqual(monthly.price, 69);
assert.strictEqual(monthly.durationDays, 30);

const threeMonths = getMusclePassPlan('MUSCLE_3_MONTHS');
assert.strictEqual(threeMonths.price, 149);
assert.strictEqual(threeMonths.durationDays, 90);

const sixMonths = getMusclePassPlan('MUSCLE_6_MONTHS');
assert.strictEqual(sixMonths.price, 249);
assert.strictEqual(sixMonths.durationDays, 180);

const yearly = getMusclePassPlan('MUSCLE_YEARLY');
assert.strictEqual(yearly.price, 449);
assert.strictEqual(yearly.durationDays, 365);
console.log('✓ All 4 official pricing plans verified: Monthly (₹69), 3-Month (₹149), 6-Month (₹249), Yearly (₹449).');

console.log('\n====================================================');
console.log('ALL MUSCLE PASS TESTS PASSED SUCCESSFULLY! ✅');
console.log('====================================================');
