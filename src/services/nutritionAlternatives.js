/**
 * MessMates — Smart Nutrition Alternatives Service
 * 
 * Provides affordable, realistic campus food alternatives when the hostel mess menu
 * cannot fulfill the student's remaining protein target.
 * 
 * Strictly respects dietary preferences (Vegetarian, Eggetarian, Non-Vegetarian)
 * and active allergies (Dairy, Gluten, Peanuts, Soy, Besan).
 */

export const CAMPUS_NUTRITION_STAPLES = [
  {
    id: 'whey_protein',
    name: 'Whey Protein',
    servingSize: '1 scoop (30g)',
    proteinG: 24,
    calories: 125,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    availability: 'Hostel Room / Gym',
    costEstimate: '₹60 - ₹80',
    description: 'Fast-digesting, high-leucine complete protein ideal for post-workout.'
  },
  {
    id: 'boiled_eggs',
    name: 'Boiled Eggs',
    servingSize: '2 whole eggs',
    proteinG: 12.6,
    calories: 144,
    category: 'Eggetarian',
    allergens: ['Eggs'],
    availability: 'Campus Canteen / Gate Shop',
    costEstimate: '₹14 - ₹20',
    description: 'Complete bio-available protein with essential micronutrients (Choline, B12).'
  },
  {
    id: 'fresh_paneer',
    name: 'Raw / Canteen Paneer',
    servingSize: '100g',
    proteinG: 18.3,
    calories: 265,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    availability: 'Campus Dairy / Canteen',
    costEstimate: '₹35 - ₹45',
    description: 'Casein-rich slow-digesting protein, keeps you satiated through night study.'
  },
  {
    id: 'roasted_chana',
    name: 'Roasted Chana (Gram)',
    servingSize: '1 bowl (50g)',
    proteinG: 9.8,
    calories: 180,
    category: 'Vegetarian',
    allergens: ['Besan'],
    availability: 'Campus Tuck Shop / General Store',
    costEstimate: '₹15 - ₹20',
    description: 'Crunchy hostel study snack packed with fiber and plant protein.'
  },
  {
    id: 'milk_glass',
    name: 'Hot / Cold Milk',
    servingSize: '1 glass (250ml)',
    proteinG: 8.2,
    calories: 155,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    availability: 'Mess Counter (Breakfast/Dinner) / Amul Booth',
    costEstimate: '₹15 - ₹20',
    description: 'Readily available at campus booths; excellent calcium and protein source.'
  },
  {
    id: 'plain_curd',
    name: 'Fresh Curd / Dahi',
    servingSize: '1 cup (150g)',
    proteinG: 6.2,
    calories: 95,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    availability: 'Mess Counter / Mother Dairy Booth',
    costEstimate: '₹15 - ₹25',
    description: 'Probiotic food supporting gut digestion and steady protein absorption.'
  },
  {
    id: 'moong_sprouts',
    name: 'Sprouts Chaat (Moong/Chana)',
    servingSize: '1 bowl (100g)',
    proteinG: 7.4,
    calories: 110,
    category: 'Vegetarian',
    allergens: [],
    availability: 'Hostel Self-prep / Breakfast Salad Bar',
    costEstimate: '₹10 - ₹15',
    description: 'Enzyme-rich raw sprout snack with high fiber and micronutrients.'
  },
  {
    id: 'soya_chunks',
    name: 'Boiled Soya Chunks',
    servingSize: '50g (dry)',
    proteinG: 26.0,
    calories: 172,
    category: 'Vegetarian',
    allergens: ['Soy'],
    availability: 'Hostel Room Prep / Kettle',
    costEstimate: '₹15 - ₹20',
    description: 'Inexpensive plant protein powerhouse with over 52% protein by dry weight.'
  },
  {
    id: 'peanut_butter',
    name: 'Peanut Butter (with Roti/Bread)',
    servingSize: '2 tbsp (32g)',
    proteinG: 8.0,
    calories: 190,
    category: 'Vegetarian',
    allergens: ['Peanuts'],
    availability: 'Hostel Room / Tuck Shop',
    costEstimate: '₹20 - ₹25',
    description: 'Healthy monounsaturated fats with steady calories and protein.'
  }
];

/**
 * Filters alternatives according to student's dietary preference and allergies.
 * 
 * @param {object} params
 * @param {string} [params.dietaryPreference='Vegetarian']
 * @param {Array<string>} [params.allergies=[]]
 * @param {number} [params.remainingProteinNeeded=0]
 * @returns {Array<object>} Filtered and prioritized alternatives
 */
export function getSmartAlternatives({
  dietaryPreference = 'Vegetarian',
  allergies = [],
  remainingProteinNeeded = 0
} = {}) {
  const pref = dietaryPreference.toLowerCase();
  const lowerAllergies = (allergies || []).map(a => a.toLowerCase());

  const compatible = CAMPUS_NUTRITION_STAPLES.filter(item => {
    // Dietary check
    if (pref === 'vegetarian' && item.category !== 'Vegetarian') {
      return false;
    }
    if (pref === 'eggetarian' && item.category === 'Non-Vegetarian') {
      return false;
    }

    // Allergies check
    const hasAllergen = item.allergens.some(a => lowerAllergies.includes(a.toLowerCase()));
    if (hasAllergen) {
      return false;
    }

    return true;
  });

  // Prioritize based on remaining deficit
  return compatible.map(item => {
    const servingsToGoal = remainingProteinNeeded > 0
      ? Math.max(1, Math.round((remainingProteinNeeded / item.proteinG) * 10) / 10)
      : 1;

    return {
      ...item,
      servingsToGoal,
      deficitCoveredG: Math.min(remainingProteinNeeded, item.proteinG),
      recommendationTip: remainingProteinNeeded > 20
        ? `Taking 1 serving covers ~${Math.round((item.proteinG / Math.max(1, remainingProteinNeeded)) * 100)}% of your remaining ${remainingProteinNeeded}g protein.`
        : `1 serving of this comfortably finishes today's protein target.`
    };
  });
}
