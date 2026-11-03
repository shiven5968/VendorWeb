/**
 * MessMates — Smart Nutrition & Meal Recommendation Engine
 * 
 * Deterministic, testable nutrition calculation and adaptive meal planning engine.
 * Never invents fake menu dishes. Respects student dietary preferences, allergies,
 * appetite, and actual meal-by-meal intake.
 */

import { lookupDishNutrition } from '../data/dishNutrition.js';

export const PORTION_MULTIPLIERS = {
  'NONE': 0,
  'QUARTER': 0.25,
  'HALF': 0.5,
  'THREE_QUARTER': 0.75,
  'FULL': 1.0,
  'ONE_AND_HALF': 1.5,
  'DOUBLE': 2.0
};

export const PORTION_LABELS = {
  0: 'Skipped (0 serving)',
  0.25: '1/4 serving (light bite)',
  0.5: '1/2 serving (small portion)',
  0.75: '3/4 serving',
  1.0: '1 full standard serving',
  1.5: '1.5 servings (extra)',
  2.0: '2 full servings (double)'
};

/**
 * Calculates deterministic nutrition for a logged dish.
 * 
 * @param {object} params
 * @param {number} params.proteinPerServing - Stored baseline protein in grams
 * @param {number} [params.caloriesPerServing] - Stored baseline calories
 * @param {number} params.portion - Multiplier (e.g. 1.0, 0.5, 1.5)
 * @returns {object} { proteinConsumed: number, caloriesConsumed: number }
 */
export function calculateItemNutrition({ proteinPerServing = 0, caloriesPerServing = 0, portion = 1.0 }) {
  const p = Number(proteinPerServing) || 0;
  const c = Number(caloriesPerServing) || 0;
  const mult = Math.max(0, Number(portion) || 0);

  return {
    proteinConsumed: Math.round((p * mult) * 10) / 10,
    caloriesConsumed: Math.round(c * mult)
  };
}

/**
 * Aggregates all meal logs for a single day.
 * 
 * @param {Array} logs - Array of logged meal objects
 * @param {number} targetProtein - Student's daily protein target in grams
 * @param {number} [targetCalories] - Optional calorie target
 * @returns {object} Summary of consumption and remaining targets
 */
export function calculateDailyNutritionSummary(logs = [], targetProtein = 120, targetCalories = null) {
  const validTarget = Math.max(1, Number(targetProtein) || 120);

  let totalProtein = 0;
  let totalCalories = 0;
  let completedMealsCount = 0;
  const mealStatuses = {
    Breakfast: 'PENDING',
    Lunch: 'PENDING',
    Snacks: 'PENDING',
    Dinner: 'PENDING'
  };

  for (const log of logs) {
    if (!log) continue;
    
    // Mark status
    if (log.mealType && mealStatuses[log.mealType] !== undefined) {
      mealStatuses[log.mealType] = log.status || 'COMPLETED';
      if (log.status !== 'SKIPPED') {
        completedMealsCount++;
      }
    }

    if (Array.isArray(log.items)) {
      for (const item of log.items) {
        totalProtein += Number(item.proteinConsumed) || 0;
        totalCalories += Number(item.caloriesConsumed) || 0;
      }
    } else {
      totalProtein += Number(log.proteinConsumed) || 0;
      totalCalories += Number(log.caloriesConsumed) || 0;
    }
  }

  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCalories = Math.round(totalCalories);

  const remainingProtein = Math.max(0, Math.round((validTarget - totalProtein) * 10) / 10);
  const completionPercentage = Math.min(100, Math.round((totalProtein / validTarget) * 100));

  let remainingCalories = null;
  if (targetCalories && Number(targetCalories) > 0) {
    remainingCalories = Math.max(0, Math.round(Number(targetCalories) - totalCalories));
  }

  return {
    targetProtein: validTarget,
    consumedProtein: totalProtein,
    remainingProtein,
    completionPercentage,
    targetCalories,
    consumedCalories: totalCalories,
    remainingCalories,
    completedMealsCount,
    mealStatuses
  };
}

/**
 * Breaks down an actual menu meal string/object into individual items with nutrition.
 * 
 * @param {object} meal - Meal object from hostelMenus / AppContext
 * @returns {Array<object>} Array of parsed items with individual nutrition
 */
export function parseMealItemsWithNutrition(meal) {
  if (!meal) return [];

  // Extract raw item names
  let itemNames = [];
  if (Array.isArray(meal.items)) {
    itemNames = meal.items;
  } else if (typeof meal.items === 'string') {
    itemNames = meal.items.split(',').map(s => s.trim()).filter(Boolean);
  } else if (meal.name) {
    itemNames = meal.name.split('&').map(s => s.trim()).filter(Boolean);
  }

  return itemNames.map((name, index) => {
    const nutrition = lookupDishNutrition(name);
    return {
      id: `${meal.id || meal.category}_item_${index}`,
      name,
      servingSize: nutrition?.servingSize || '1 standard portion',
      proteinG: nutrition ? nutrition.proteinG : null,
      calories: nutrition ? nutrition.calories : null,
      carbsG: nutrition?.carbsG ?? null,
      fatG: nutrition?.fatG ?? null,
      category: nutrition?.category || 'Vegetarian',
      allergens: nutrition?.allergens || [],
      source: nutrition?.source || 'ICMR-NIN IFCT 2017'
    };
  });
}

/**
 * Intelligent Meal Recommendation Engine.
 * Analyzes remaining protein needed and generates sensible portion suggestions
 * from today's actual mess menu items.
 * 
 * @param {object} params
 * @param {Array} params.todayMeals - 4 actual meals from hostelMenus for today
 * @param {object} params.profile - Student nutrition profile
 * @param {Array} params.todayLogs - Existing logs for today
 * @returns {object} Meal-by-meal recommendations and explanations
 */
export function generateSmartMealPlan({ todayMeals = [], profile = {}, todayLogs = [] }) {
  const targetProtein = Math.max(1, Number(profile.dailyProteinTargetG || profile.proteinTarget || 120));
  const summary = calculateDailyNutritionSummary(todayLogs, targetProtein);
  const dietaryPref = (profile.dietaryPreference || 'Vegetarian').toLowerCase();
  const allergies = (profile.allergies || []).map(a => a.toLowerCase());
  const portionPref = profile.preferredPortion || 'Regular'; // 'Small', 'Regular', 'Large'

  // Portion preference multiplier baseline
  const portionMultiplier = portionPref === 'Small' ? 0.8 : portionPref === 'Large' ? 1.25 : 1.0;

  // Identify remaining unlogged meals
  const mealOrder = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const remainingMealCategories = mealOrder.filter(cat => {
    const status = summary.mealStatuses[cat];
    return status === 'PENDING';
  });

  const remainingProteinNeeded = summary.remainingProtein;
  const numRemaining = remainingMealCategories.length;

  const mealRecommendations = {};

  for (const cat of mealOrder) {
    const meal = (todayMeals || []).find(m => m.category === cat) || null;
    const isLogged = summary.mealStatuses[cat] !== 'PENDING';
    const existingLog = (todayLogs || []).find(l => l.mealType === cat);

    if (!meal) {
      mealRecommendations[cat] = {
        category: cat,
        status: isLogged ? summary.mealStatuses[cat] : 'NO_MENU',
        title: `${cat} (No Menu Available)`,
        items: [],
        suggestedItems: [],
        totalSuggestedProtein: 0,
        explanation: 'No menu data available for this meal slot.'
      };
      continue;
    }

    const parsedItems = parseMealItemsWithNutrition(meal);

    // Filter compatible items based on dietary preferences and allergies
    const compatibleItems = parsedItems.filter(item => {
      // Dietary filter
      if (dietaryPref === 'vegetarian' && item.category !== 'Vegetarian') return false;
      if (dietaryPref === 'eggetarian' && item.category === 'Non-Vegetarian') return false;
      // Allergies filter
      if (item.allergens.some(al => allergies.includes(al.toLowerCase()))) return false;
      return true;
    });

    if (isLogged) {
      mealRecommendations[cat] = {
        category: cat,
        status: existingLog?.status || 'COMPLETED',
        title: meal.title || meal.name,
        items: parsedItems,
        suggestedItems: [],
        totalSuggestedProtein: existingLog?.proteinConsumed || 0,
        explanation: existingLog?.status === 'SKIPPED' 
          ? 'You skipped this meal. Remaining targets have been redistributed.'
          : `Logged ${existingLog?.proteinConsumed || 0}g protein.`
      };
      continue;
    }

    // Unlogged: Compute optimal recommendation for this meal slot
    // Meal protein budget: proportion based on meal type
    let mealWeight = 0.25;
    if (cat === 'Breakfast') mealWeight = 0.25;
    else if (cat === 'Lunch') mealWeight = 0.35;
    else if (cat === 'Snacks') mealWeight = 0.15;
    else if (cat === 'Dinner') mealWeight = 0.35;

    // Allocate from remaining protein
    const slotTargetProtein = numRemaining > 0 
      ? Math.round((remainingProteinNeeded / numRemaining) * 10) / 10
      : Math.round((targetProtein * mealWeight) * 10) / 10;

    // Pick top protein contributors from this meal's menu items
    const sortedContributors = [...compatibleItems]
      .filter(item => (item.proteinG || 0) > 0)
      .sort((a, b) => (b.proteinG || 0) - (a.proteinG || 0));

    const suggestedItems = [];
    let accumulatedProtein = 0;

    for (const item of sortedContributors) {
      if (accumulatedProtein >= slotTargetProtein && suggestedItems.length >= 2) break;

      let portion = 1.0 * portionMultiplier;
      // If student needs significantly more protein and item is a high-protein staple (Paneer, Dal, Eggs, Chole, Sprouts, Milk)
      if (item.proteinG >= 6 && remainingProteinNeeded > 50 && portionMultiplier >= 1.0) {
        portion = 1.5;
      }

      const itemProtein = Math.round((item.proteinG * portion) * 10) / 10;
      suggestedItems.push({
        ...item,
        recommendedPortion: portion,
        recommendedPortionLabel: PORTION_LABELS[portion] || `${portion}x serving`,
        recommendedProteinG: itemProtein
      });
      accumulatedProtein += itemProtein;
    }

    accumulatedProtein = Math.round(accumulatedProtein * 10) / 10;

    // Build supportive, transparent explanation
    let explanation = '';
    if (suggestedItems.length === 0) {
      explanation = 'Nutrition estimates for this meal are currently being updated by the mess team.';
    } else {
      explanation = `Provides ~${accumulatedProtein}g protein towards your remaining ${remainingProteinNeeded}g daily goal.`;
    }

    mealRecommendations[cat] = {
      category: cat,
      status: 'PENDING',
      title: meal.title || meal.name,
      image: meal.image,
      items: parsedItems,
      suggestedItems,
      targetProteinForSlot: slotTargetProtein,
      totalSuggestedProtein: accumulatedProtein,
      explanation
    };
  }

  return {
    summary,
    recommendations: mealRecommendations
  };
}
