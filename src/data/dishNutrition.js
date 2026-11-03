/**
 * MessMates — Dish Nutrition Reference Database
 * Standard reference data based on ICMR-NIN Indian Food Composition Tables (IFCT 2017)
 * and USDA FoodData Central for college hostel mess dishes.
 * 
 * Provides baseline nutritional values per standard serving.
 * Can be overridden dynamically by Mess Committee / ABES Officials via the Admin portal.
 */

export const DISH_NUTRITION_DATABASE = {
  // ── BREAKFAST ITEMS ────────────────────────────────────────────────────────
  'Veg Fried Idli': {
    servingSize: '3 pcs (150g)',
    servingWeightG: 150,
    proteinG: 6.8,
    calories: 210,
    carbsG: 38,
    fatG: 3.2,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Plain Idli': {
    servingSize: '3 pcs (150g)',
    servingWeightG: 150,
    proteinG: 5.8,
    calories: 180,
    carbsG: 36,
    fatG: 1.0,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Sambhar': {
    servingSize: '1 bowl (150g)',
    servingWeightG: 150,
    proteinG: 4.5,
    calories: 110,
    carbsG: 18,
    fatG: 2.5,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Coconut Chutney': {
    servingSize: '2 tbsp (50g)',
    servingWeightG: 50,
    proteinG: 1.2,
    calories: 95,
    carbsG: 3,
    fatG: 9.0,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Lal Chutney': {
    servingSize: '1 tbsp (30g)',
    servingWeightG: 30,
    proteinG: 0.6,
    calories: 35,
    carbsG: 6,
    fatG: 1.0,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Tea': {
    servingSize: '1 cup (150ml)',
    servingWeightG: 150,
    proteinG: 1.5,
    calories: 75,
    carbsG: 10,
    fatG: 2.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Milk': {
    servingSize: '1 glass (200ml)',
    servingWeightG: 200,
    proteinG: 6.8,
    calories: 130,
    carbsG: 10,
    fatG: 6.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Seasonal Fruit': {
    servingSize: '1 medium (100g)',
    servingWeightG: 100,
    proteinG: 1.0,
    calories: 60,
    carbsG: 14,
    fatG: 0.2,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Banana': {
    servingSize: '1 medium (100g)',
    servingWeightG: 100,
    proteinG: 1.3,
    calories: 89,
    carbsG: 23,
    fatG: 0.3,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Dal Khasta Kachori': {
    servingSize: '2 pcs (120g)',
    servingWeightG: 120,
    proteinG: 5.5,
    calories: 360,
    carbsG: 44,
    fatG: 18.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Aloo Tamatar Sabji': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 2.6,
    calories: 140,
    carbsG: 20,
    fatG: 5.5,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Matar Kulche': {
    servingSize: '2 kulche + matar (250g)',
    servingWeightG: 250,
    proteinG: 14.2,
    calories: 480,
    carbsG: 72,
    fatG: 12.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Aloo Paratha': {
    servingSize: '2 pcs (200g)',
    servingWeightG: 200,
    proteinG: 7.5,
    calories: 420,
    carbsG: 62,
    fatG: 15.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Pav Bhaji': {
    servingSize: '2 pav + bhaji (250g)',
    servingWeightG: 250,
    proteinG: 8.5,
    calories: 440,
    carbsG: 65,
    fatG: 16.0,
    category: 'Vegetarian',
    allergens: ['Gluten', 'Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Puri Aloo Sabji': {
    servingSize: '4 puris + aloo (250g)',
    servingWeightG: 250,
    proteinG: 7.0,
    calories: 490,
    carbsG: 68,
    fatG: 22.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Jalebi': {
    servingSize: '2 pcs (60g)',
    servingWeightG: 60,
    proteinG: 1.5,
    calories: 210,
    carbsG: 40,
    fatG: 5.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Veg Sandwich': {
    servingSize: '2 slices (120g)',
    servingWeightG: 120,
    proteinG: 5.2,
    calories: 220,
    carbsG: 34,
    fatG: 6.5,
    category: 'Vegetarian',
    allergens: ['Gluten', 'Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Sprouts Chaat': {
    servingSize: '1 bowl (150g)',
    servingWeightG: 150,
    proteinG: 12.5,
    calories: 160,
    carbsG: 26,
    fatG: 1.5,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Boiled Eggs': {
    servingSize: '2 eggs (100g)',
    servingWeightG: 100,
    proteinG: 12.6,
    calories: 144,
    carbsG: 1.1,
    fatG: 9.8,
    category: 'Eggetarian',
    allergens: ['Egg'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Omelette': {
    servingSize: '2 eggs (120g)',
    servingWeightG: 120,
    proteinG: 13.0,
    calories: 190,
    carbsG: 2.0,
    fatG: 14.5,
    category: 'Eggetarian',
    allergens: ['Egg'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Paneer Bhurji / Sandwich': {
    servingSize: '1 serving (150g)',
    servingWeightG: 150,
    proteinG: 16.5,
    calories: 310,
    carbsG: 12,
    fatG: 22.0,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },

  // ── LUNCH & DINNER MAINS ──────────────────────────────────────────────────
  'Rajma': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 8.5,
    calories: 180,
    carbsG: 28,
    fatG: 3.5,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Kaabli Chole': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 9.2,
    calories: 210,
    carbsG: 32,
    fatG: 4.8,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Arhar Daal': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 6.8,
    calories: 145,
    carbsG: 22,
    fatG: 3.0,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Mix Dal': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 7.2,
    calories: 155,
    carbsG: 23,
    fatG: 3.2,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Dal Makhani': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 8.1,
    calories: 240,
    carbsG: 24,
    fatG: 12.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Kali Masoor Dal': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 7.5,
    calories: 150,
    carbsG: 24,
    fatG: 2.8,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Kadhi Pakora': {
    servingSize: '1 katori (180g)',
    servingWeightG: 180,
    proteinG: 6.5,
    calories: 195,
    carbsG: 20,
    fatG: 9.5,
    category: 'Vegetarian',
    allergens: ['Dairy', 'Besan'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Butter Paneer Masala': {
    servingSize: '1 katori (180g)',
    servingWeightG: 180,
    proteinG: 14.8,
    calories: 320,
    carbsG: 14,
    fatG: 23.0,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Kadhai Paneer': {
    servingSize: '1 katori (180g)',
    servingWeightG: 180,
    proteinG: 15.2,
    calories: 310,
    carbsG: 12,
    fatG: 22.0,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Shahi Paneer': {
    servingSize: '1 katori (180g)',
    servingWeightG: 180,
    proteinG: 14.2,
    calories: 330,
    carbsG: 16,
    fatG: 24.0,
    category: 'Vegetarian',
    allergens: ['Dairy', 'Nuts'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Soyabean Shimla Mirch': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 16.2,
    calories: 190,
    carbsG: 15,
    fatG: 6.5,
    category: 'Vegetarian',
    allergens: ['Soy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Mix Veg': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 3.5,
    calories: 130,
    carbsG: 18,
    fatG: 4.8,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Aloo Shimla Mirch': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 2.8,
    calories: 140,
    carbsG: 22,
    fatG: 5.0,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Lauki Kofta': {
    servingSize: '1 katori (150g)',
    servingWeightG: 150,
    proteinG: 4.2,
    calories: 180,
    carbsG: 19,
    fatG: 9.5,
    category: 'Vegetarian',
    allergens: ['Besan'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Roti': {
    servingSize: '1 pc (50g)',
    servingWeightG: 50,
    proteinG: 3.2,
    calories: 110,
    carbsG: 22,
    fatG: 0.8,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Rice': {
    servingSize: '1 bowl (150g cooked)',
    servingWeightG: 150,
    proteinG: 3.5,
    calories: 195,
    carbsG: 42,
    fatG: 0.6,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Curd': {
    servingSize: '1 bowl (100g)',
    servingWeightG: 100,
    proteinG: 4.1,
    calories: 70,
    carbsG: 4.5,
    fatG: 4.0,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Boondi Raita': {
    servingSize: '1 bowl (100g)',
    servingWeightG: 100,
    proteinG: 3.8,
    calories: 95,
    carbsG: 7.5,
    fatG: 5.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Mix Salad': {
    servingSize: '1 plate (80g)',
    servingWeightG: 80,
    proteinG: 0.8,
    calories: 25,
    carbsG: 5.0,
    fatG: 0.2,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Bhature': {
    servingSize: '2 pcs (140g)',
    servingWeightG: 140,
    proteinG: 6.2,
    calories: 380,
    carbsG: 52,
    fatG: 16.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },

  // ── SNACKS ─────────────────────────────────────────────────────────────────
  'Burger': {
    servingSize: '1 pc (150g)',
    servingWeightG: 150,
    proteinG: 8.5,
    calories: 320,
    carbsG: 46,
    fatG: 11.5,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Samosa': {
    servingSize: '1 pc (80g)',
    servingWeightG: 80,
    proteinG: 3.8,
    calories: 240,
    carbsG: 28,
    fatG: 12.5,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Bread Pakoda': {
    servingSize: '1 pc (100g)',
    servingWeightG: 100,
    proteinG: 5.2,
    calories: 260,
    carbsG: 32,
    fatG: 12.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Macaroni': {
    servingSize: '1 plate (150g)',
    servingWeightG: 150,
    proteinG: 5.5,
    calories: 230,
    carbsG: 38,
    fatG: 6.0,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Chowmein': {
    servingSize: '1 plate (150g)',
    servingWeightG: 150,
    proteinG: 5.2,
    calories: 240,
    carbsG: 40,
    fatG: 7.0,
    category: 'Vegetarian',
    allergens: ['Gluten', 'Soy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Bread Roll': {
    servingSize: '2 pcs (120g)',
    servingWeightG: 120,
    proteinG: 4.8,
    calories: 270,
    carbsG: 36,
    fatG: 11.5,
    category: 'Vegetarian',
    allergens: ['Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Aloo Tikki Chaat': {
    servingSize: '1 plate (150g)',
    servingWeightG: 150,
    proteinG: 4.5,
    calories: 260,
    carbsG: 36,
    fatG: 10.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Papdi Chaat': {
    servingSize: '1 plate (150g)',
    servingWeightG: 150,
    proteinG: 4.2,
    calories: 245,
    carbsG: 34,
    fatG: 10.0,
    category: 'Vegetarian',
    allergens: ['Gluten', 'Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },

  // ── SWEETS & DESSERTS ──────────────────────────────────────────────────────
  'Suji Halwa': {
    servingSize: '1 katori (100g)',
    servingWeightG: 100,
    proteinG: 3.5,
    calories: 280,
    carbsG: 46,
    fatG: 9.5,
    category: 'Vegetarian',
    allergens: ['Gluten', 'Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Gulab Jamun': {
    servingSize: '2 pcs (80g)',
    servingWeightG: 80,
    proteinG: 3.2,
    calories: 260,
    carbsG: 44,
    fatG: 8.0,
    category: 'Vegetarian',
    allergens: ['Dairy', 'Gluten'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Kheer': {
    servingSize: '1 katori (120g)',
    servingWeightG: 120,
    proteinG: 4.2,
    calories: 210,
    carbsG: 34,
    fatG: 6.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Moong Dal Halwa': {
    servingSize: '1 katori (100g)',
    servingWeightG: 100,
    proteinG: 6.5,
    calories: 340,
    carbsG: 42,
    fatG: 16.0,
    category: 'Vegetarian',
    allergens: ['Dairy', 'Nuts'],
    source: 'ICMR-NIN IFCT 2017'
  },

  // ── CANTEEN / OUTSIDE COMMONLY ADDED ITEMS ──────────────────────────────────
  'Whey Protein Scoop': {
    servingSize: '1 scoop (30g)',
    servingWeightG: 30,
    proteinG: 24.0,
    calories: 120,
    carbsG: 2,
    fatG: 1.5,
    category: 'Vegetarian',
    allergens: ['Dairy'],
    source: 'Standard Supplement Label'
  },
  'Boiled Chicken Breast': {
    servingSize: '1 portion (150g)',
    servingWeightG: 150,
    proteinG: 31.0,
    calories: 165,
    carbsG: 0,
    fatG: 3.6,
    category: 'Non-Vegetarian',
    allergens: [],
    source: 'USDA FDC'
  },
  'Egg Bhurji (3 eggs)': {
    servingSize: '1 plate (160g)',
    servingWeightG: 160,
    proteinG: 18.5,
    calories: 260,
    carbsG: 4,
    fatG: 19.0,
    category: 'Eggetarian',
    allergens: ['Egg'],
    source: 'ICMR-NIN IFCT 2017'
  },
  'Peanut Butter': {
    servingSize: '2 tbsp (32g)',
    servingWeightG: 32,
    proteinG: 8.0,
    calories: 190,
    carbsG: 7,
    fatG: 16.0,
    category: 'Vegetarian',
    allergens: ['Peanuts'],
    source: 'USDA FDC'
  },
  'Roasted Chana': {
    servingSize: '1 fistful (50g)',
    servingWeightG: 50,
    proteinG: 9.5,
    calories: 185,
    carbsG: 29,
    fatG: 2.5,
    category: 'Vegetarian',
    allergens: [],
    source: 'ICMR-NIN IFCT 2017'
  }
};

/**
 * Normalizes item name for fuzzy lookup in the nutrition database.
 */
export function lookupDishNutrition(itemName) {
  if (!itemName || typeof itemName !== 'string') return null;
  const clean = itemName.trim().toLowerCase();

  // Exact match first
  for (const [key, data] of Object.entries(DISH_NUTRITION_DATABASE)) {
    if (key.toLowerCase() === clean) {
      return { itemName: key, ...data };
    }
  }

  // Partial match
  for (const [key, data] of Object.entries(DISH_NUTRITION_DATABASE)) {
    const k = key.toLowerCase();
    if (clean.includes(k) || k.includes(clean)) {
      return { itemName: key, ...data };
    }
  }

  // Common keywords matching
  if (clean.includes('egg') || clean.includes('anda')) return { itemName, ...DISH_NUTRITION_DATABASE['Boiled Eggs'] };
  if (clean.includes('paneer')) return { itemName, ...DISH_NUTRITION_DATABASE['Butter Paneer Masala'] };
  if (clean.includes('soya')) return { itemName, ...DISH_NUTRITION_DATABASE['Soyabean Shimla Mirch'] };
  if (clean.includes('rajma')) return { itemName, ...DISH_NUTRITION_DATABASE['Rajma'] };
  if (clean.includes('chole') || clean.includes('chhole')) return { itemName, ...DISH_NUTRITION_DATABASE['Kaabli Chole'] };
  if (clean.includes('dal') || clean.includes('daal')) return { itemName, ...DISH_NUTRITION_DATABASE['Arhar Daal'] };
  if (clean.includes('roti') || clean.includes('chapati')) return { itemName, ...DISH_NUTRITION_DATABASE['Roti'] };
  if (clean.includes('rice') || clean.includes('chawal')) return { itemName, ...DISH_NUTRITION_DATABASE['Rice'] };
  if (clean.includes('curd') || clean.includes('dahi') || clean.includes('raita')) return { itemName, ...DISH_NUTRITION_DATABASE['Curd'] };
  if (clean.includes('milk') || clean.includes('doodh')) return { itemName, ...DISH_NUTRITION_DATABASE['Milk'] };
  if (clean.includes('sprout')) return { itemName, ...DISH_NUTRITION_DATABASE['Sprouts Chaat'] };
  if (clean.includes('idli')) return { itemName, ...DISH_NUTRITION_DATABASE['Plain Idli'] };
  if (clean.includes('kachori')) return { itemName, ...DISH_NUTRITION_DATABASE['Dal Khasta Kachori'] };
  if (clean.includes('paratha')) return { itemName, ...DISH_NUTRITION_DATABASE['Aloo Paratha'] };
  if (clean.includes('sandwich')) return { itemName, ...DISH_NUTRITION_DATABASE['Veg Sandwich'] };
  if (clean.includes('salad')) return { itemName, ...DISH_NUTRITION_DATABASE['Mix Salad'] };
  if (clean.includes('fruit') || clean.includes('banana')) return { itemName, ...DISH_NUTRITION_DATABASE['Banana'] };
  if (clean.includes('tea') || clean.includes('chai')) return { itemName, ...DISH_NUTRITION_DATABASE['Tea'] };

  return null;
}
