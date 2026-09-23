/**
 * MessMates — Centralized Weekly Menus & Hostel Definitions
 * ABES EC / ABES BS Campus
 *
 * Three fully-separated mess datasets:
 *   BOYS_JUNIOR_WEEKLY_MENU  — I Year & II Year (Naina Caters, W.E.F. 18 Sept 2026)
 *   BOYS_SENIOR_WEEKLY_MENU  — III Yr, IV Yr, MBA & MCA (Star Caterers, W.E.F. 24 Aug 2026)
 *   GIRLS_WEEKLY_MENU        — Girls Hostel (Session 2026-27, W.E.F. 19 Sept 2026)
 *
 * IMPORTANT: Each mess has its own independent 7×4 meal matrix.
 * No cross-mess meal contamination is permitted.
 *
 * Common image assets are reused where applicable, but each meal occurrence
 * (mess + day + category) is an independent entry in its own menu dataset.
 *
 * Nutrition: Estimated per ICMR-NIN IFCT 2017 / USDA FDC basis.
 * Serving sizes are mess-specific.
 */

// ── HOSTEL BLOCK DEFINITIONS ────────────────────────────────────────────────

export const BOYS_HOSTEL_BLOCKS = [
  'DNB Block',
  'VKB Block',
  'RKB Block',
  'ABB Block',
];

export const GIRLS_HOSTEL_BLOCKS = [
  'Block A (Girls)',
  'Block B (Girls)',
  'Block C (Girls)',
];

import { isGirlsHostelBlock } from '../config/menuGroups.js';
export { isGirlsHostelBlock };

// ── SHARED IMAGE PATHS ──────────────────────────────────────────────────────

export const MEAL_IMAGES = {
  // Breakfasts
  idli_sambhar: '/meal-images/veg-fried-idli.jpg',
  matar_kulche: '/meal-images/matar-kulche.jpg',
  aloo_paratha: '/meal-images/aloo-paratha.jpg',
  pav_bhaji: '/meal-images/pav-bhaji.jpg',
  puri_aloo_jalebi: '/meal-images/puri-aloo-tamatar.jpg',
  aloo_sandwich: '/meal-images/veg-sandwich.jpg',
  bread_butter: '/meal-images/veg-sandwich.jpg',

  // Lunches
  rajma_rice: '/meal-images/rajma-masala.jpg',
  tahri_pulao: '/meal-images/aloo-tamatar-tahri.jpg',
  chhole_rice: '/meal-images/kaabli-chhole.jpg',
  kadhi_rice: '/meal-images/kadhi-rice.jpg',
  mix_dal_taroi: '/meal-images/mix-dal-tarohi.jpg',
  chole_bhature: '/meal-images/chhole-bhature.jpg',
  arhar_dal_thali: '/meal-images/arhar-dal-aloo-gobhi.jpg',

  // Snacks
  burger: '/meal-images/burger.jpg',
  macaroni: '/meal-images/macaroni.jpg',
  samosa: '/meal-images/samosa.jpg',
  pakoda: '/meal-images/bread-pakoda.jpg',
  chowmein: '/meal-images/chowmein.jpg',
  bread_roll: '/meal-images/bread-roll.jpg',
  off_snacks: '',
  aloo_patties: '/meal-images/burger.jpg',

  // Dinners
  kali_masoor_icecream: '/meal-images/kali-masoor-aloo-beans.jpg',
  butter_paneer_puri: '/meal-images/butter-paneer.jpg',
  dal_makhani_thali: '/meal-images/dal-makhani-mix-veg.jpg',
  arhar_dal_lauki: '/meal-images/arhar-dal-lauki.jpg',
  lauki_kofta_kheer: '/meal-images/lauki-kofta-arabi.jpg',
};

export const GH_IMAGES = {
  fried_idli: '/meal-images/veg-fried-idli.jpg',
  shahi_paneer: '/meal-images/butter-paneer.jpg',
  bread_butter_cornflakes: '/meal-images/veg-sandwich.jpg',
  manchurian_rice: '/meal-images/mix-dal-tarohi.jpg',
  papdi_chaat: '/meal-images/macaroni.jpg',
  palak_poori: '/meal-images/puri-aloo-tamatar.jpg',
  kadhi_pakora: '/meal-images/kadhi-rice.jpg',
};

// ═══════════════════════════════════════════════════════════════════════════
//  BOYS JUNIOR WEEKLY MENU
//  Caterer: Naina Caters (I Year & II Year)
//  Effective: W.E.F. 18 Sept 2026
//  ABESEC & ABESBS, Ghaziabad
// ═══════════════════════════════════════════════════════════════════════════

export const BOYS_JUNIOR_WEEKLY_MENU = {
  Monday: {
    Breakfast: {
      title: 'Veg Fried Idli & Plain Idli',
      items: ['Veg Fried Idli', 'Plain Idli', 'Sambhar', 'Coconut Chutney', 'Lal Chutney', 'Tea', 'Milk', 'Seasonal Fruit'],
      servingSize: 'Fried Idli (3 pcs), Plain Idli (3 pcs), 150g Sambhar, 50g Coconut Chutney, Lal Chutney, 150ml Tea, 150ml Milk, 100g Seasonal Fruit',
      image: MEAL_IMAGES.idli_sambhar,
      calories: '605 kcal', protein: '20.3g', carbs: '82g', fats: '22.2g', fiber: '8.5g',
    },
    Lunch: {
      title: 'Mix Veg & Rajma',
      items: ['Mix Veg', 'Rajma', 'Roti', 'Rice', 'Mix Salad', 'Boondi Raita', 'Lemon 1/2'],
      servingSize: '150g Mix Veg, 150g Rajma, 200g Roti (4 pcs), 200g Cooked Rice, 50g Mix Salad, 50g Boondi Raita, Lemon 1/2',
      image: MEAL_IMAGES.rajma_rice,
      calories: '1080 kcal', protein: '36.3g', carbs: '197.5g', fats: '18.2g', fiber: '24.3g',
    },
    Snacks: {
      title: 'Burger & Tea',
      items: ['Burger', 'Chilly Sauce', 'Tomato Sauce', 'Tea'],
      servingSize: '1 pc Burger, 20g Sauce, 150ml Tea',
      image: MEAL_IMAGES.burger,
      calories: '535 kcal', protein: '17.5g', carbs: '65g', fats: '22.5g', fiber: '3.2g',
    },
    Dinner: {
      title: 'Arhar Daal & Aloo Shimla Mirch',
      items: ['Arhar Daal', 'Aloo Shimla Mirch', 'Rice', 'Roti', 'Suji Halwa', 'Matar Mushroom', 'Moong Dal Halwa (Monthly Special)'],
      servingSize: '150g Arhar Daal, 150g Aloo Shimla Mirch, 200g Cooked Rice, 200g Roti (4 pcs), 100g Suji Halwa, 150g Matar Mushroom',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '1450 kcal', protein: '41.9g', carbs: '249g', fats: '32.1g', fiber: '27.6g',
    },
  },
  Tuesday: {
    Breakfast: {
      title: 'Dal Khasta Kachori & Aloo Tamatar',
      items: ['Dal Khasta Kachori', 'Aloo Tamatar Sabji', 'Milk', 'Tea', 'Seasonal Fruit'],
      servingSize: 'Dal Khasta Kachori (2 pcs), 150g Aloo Tamatar Sabji, 150ml Milk Tea, 100g Seasonal Fruit',
      image: MEAL_IMAGES.puri_aloo_jalebi,
      calories: '620 kcal', protein: '14.7g', carbs: '87g', fats: '23.9g', fiber: '11.5g',
    },
    Lunch: {
      title: 'Kaabli Chole & Kashifal',
      items: ['Kaabli Chole', 'Kashifal', 'Rice', 'Mix Salad', 'Curd', 'Lemon 1/3'],
      servingSize: '150g Kaabli Chole, 150g Kashifal, 200g Cooked Rice, 50g Mix Salad, 50g Curd, Lemon 1/3',
      image: MEAL_IMAGES.chhole_rice,
      calories: '1106 kcal', protein: '35.5g', carbs: '207.8g', fats: '20.8g', fiber: '24.2g',
    },
    Snacks: {
      title: 'Macaroni / Chowmein',
      items: ['Macaroni / Chowmein', 'Tomato Sauce', 'Chilly Sauce', 'Coffee', 'Tea'],
      servingSize: '200g (1 bowl) Macaroni / Chowmein, 20g Sauce, 150ml Coffee',
      image: MEAL_IMAGES.macaroni,
      calories: '455 kcal', protein: '13g', carbs: '71g', fats: '13.5g', fiber: '4.2g',
    },
    Dinner: {
      title: 'Mix Dal & Aloo Matar Patta Gobhi',
      items: ['Mix Dal', 'Aloo Matar Patta Gobhi', 'Rice', 'Roti', 'Ice Cream (Butterscotch / Chocolate)', 'Mix Salad'],
      servingSize: '150g Mix Dal, 150g Aloo Matar Patta Gobhi, 200g Cooked Rice, 200g Roti (4 pcs), 60g Ice Cream, 50g Mix Salad',
      image: MEAL_IMAGES.kali_masoor_icecream,
      calories: '1120 kcal', protein: '34g', carbs: '206.5g', fats: '19.7g', fiber: '22.8g',
    },
  },
  Wednesday: {
    Breakfast: {
      title: 'Aloo Paratha & Curd',
      items: ['Aloo Paratha', 'Green Chutney', 'Tea', 'Curd', 'Seasonal Fruit'],
      servingSize: 'Aloo Paratha (2 pcs), Green Chutney, 150ml Tea, 50g Curd, 100g Seasonal Fruit',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '536 kcal', protein: '15.2g', carbs: '81.3g', fats: '17.5g', fiber: '9.5g',
    },
    Lunch: {
      title: 'Tahri & Aloo Tamatar Sabji',
      items: ['Tahri', 'Aloo Tamatar Sabji', 'Roti', 'Curd', 'Mix Salad', '1/2 Hari Chutney'],
      servingSize: '200g Tahri, 150g Aloo Tamatar Sabji, 200g Roti (4 pcs), 50g Curd, 50g Mix Salad, Hari Chutney',
      image: MEAL_IMAGES.tahri_pulao,
      calories: '986 kcal', protein: '25.6g', carbs: '180.8g', fats: '19.9g', fiber: '20.2g',
    },
    Snacks: {
      title: 'Samosa (BIG) & Tea',
      items: ['Samosa (BIG)', 'Tomato Sauce', 'Chilly Sauce', 'Tea'],
      servingSize: 'BIG Samosa (1 pc), 20g Sauce, 150ml Tea',
      image: MEAL_IMAGES.samosa,
      calories: '400 kcal', protein: '9g', carbs: '50g', fats: '18.5g', fiber: '4.2g',
    },
    Dinner: {
      title: 'Butter Paneer Masala / Kadhai Paneer',
      items: ['Butter Paneer Masala / Kadhai Paneer', 'Aloo Pyaaz', 'Puri / Roti', 'Veg Pulaw', 'Onion Salad'],
      servingSize: '150g Butter/Kadhai Paneer, 150g Aloo Pyaaz, Puri (4 pcs) / Roti (4 pcs), 200g Veg Pulaw, 50g Onion Salad',
      image: MEAL_IMAGES.butter_paneer_puri,
      calories: '1120 kcal', protein: '34.5g', carbs: '136g', fats: '49.1g', fiber: '15g',
    },
  },
  Thursday: {
    Breakfast: {
      title: 'Pav Bhaji',
      items: ['Pav Bhaji', 'Tea', 'Milk', 'Butter', 'Seasonal Fruit'],
      servingSize: '2 pav + 200g bhaji, 150ml Tea, 150ml Milk, Butter, 100g Seasonal Fruit',
      image: MEAL_IMAGES.pav_bhaji,
      calories: '776 kcal', protein: '21.8g', carbs: '106g', fats: '29.3g', fiber: '10.5g',
    },
    Lunch: {
      title: 'Aloo Pyaj Sabji & Kadhi',
      items: ['Aloo Pyaj Sabji', 'Kadhi', 'Rice', 'Roti', 'Papad Fried', 'Lemon 1/2'],
      servingSize: '150g Kadhi, 150g Aloo Pyaj Sabji, 200g Cooked Rice, 200g Roti (4 pcs), 1 Papad fried, Lemon 1/2',
      image: MEAL_IMAGES.kadhi_rice,
      calories: '1030 kcal', protein: '28.8g', carbs: '191.5g', fats: '17.7g', fiber: '18.3g',
    },
    Snacks: {
      title: 'Bread Pakoda & Tea',
      items: ['Bread Pakoda', 'Chilli Sauce', 'Tomato Sauce', 'Tea'],
      servingSize: 'Bread Pakoda (2 pcs), 20g Sauce, 150ml Tea',
      image: MEAL_IMAGES.pakoda,
      calories: '420 kcal', protein: '11g', carbs: '54g', fats: '17.5g', fiber: '3.2g',
    },
    Dinner: {
      title: 'Daal Makhani & Aloo Gobhi',
      items: ['Daal Makhani', 'Aloo Gobhi', 'Roti', 'Rice', 'Gulab Jamun', 'Mix Salad', 'Achar'],
      servingSize: '150g Daal Makhani, 150g Aloo Gobhi, 200g Roti (4 pcs), 200g Cooked Rice, Gulab Jamun (1 pc), 50g Mix Salad, Achar',
      image: MEAL_IMAGES.dal_makhani_thali,
      calories: '1230 kcal', protein: '33g', carbs: '214.5g', fats: '29.2g', fiber: '23.3g',
    },
  },
  Friday: {
    Breakfast: {
      title: 'Aloo Pyaaz Paratha & Curd',
      items: ['Aloo Pyaaz Paratha', 'Tea', 'Curd', 'Seasonal Fruit'],
      servingSize: 'Aloo Pyaaz Paratha (2 pcs), 150ml Tea, 50g Curd, 100g Seasonal Fruit',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '556 kcal', protein: '14.9g', carbs: '82.3g', fats: '19.9g', fiber: '10g',
    },
    Lunch: {
      title: 'Arhar Daal & Aloo Matar Jeera',
      items: ['Aloo Matar Jeera', 'Arhar Daal', 'Roti', 'Rice', 'Mix Salad', 'Boondi Raita', 'Lemon 1/2'],
      servingSize: '150g Arhar Daal, 150g Aloo Matar Jeera, 200g Roti (4 pcs), 200g Cooked Rice, 50g Mix Salad, 50g Boondi Raita, Lemon 1/2',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '1090 kcal', protein: '34.3g', carbs: '199.5g', fats: '18.7g', fiber: '23.3g',
    },
    Snacks: {
      title: 'Aloo Tikki Chaat / Papdi Chaat',
      items: ['Aloo Tikki Chaat / Papdi Chaat', 'Matar', 'Green Chutney', 'Saunth', 'Curd', 'Chaat Masala', 'Tea'],
      servingSize: 'Aloo Tikki (2 pcs) / Papdi Chaat, Matar, Green Chutney, Saunth, 50g Curd, Chaat Masala, 150ml Tea',
      image: MEAL_IMAGES.macaroni,
      calories: '526 kcal', protein: '16.9g', carbs: '74.5g', fats: '17.4g', fiber: '12g',
    },
    Dinner: {
      title: 'Chhole & Aloo Beans',
      items: ['Chhole', 'Aloo Beans', 'Rice', 'Roti', 'Besan Laddoo', 'Mix Salad', 'Achar'],
      servingSize: '150g Chhole, 150g Aloo Beans, 200g Cooked Rice, 200g Roti (4 pcs), Besan Laddoo (1 pc), 50g Mix Salad, Achar',
      image: MEAL_IMAGES.chhole_rice,
      calories: '1260 kcal', protein: '39g', carbs: '226.5g', fats: '26.2g', fiber: '28.3g',
    },
  },
  Saturday: {
    Breakfast: {
      title: 'Aloo Tamatar Sabji, Puri & Jalebi',
      items: ['Aloo Tamatar Sabji', 'Puri', 'Fry Mirchi', 'Tea', 'Jalebi', 'Curd', 'Seasonal Fruit'],
      servingSize: '150g Aloo Tamatar Sabji, Puri (4 small pcs), Fried Mirchi, 150ml Tea, Jalebi (2 small pcs), 50g Curd, 100g Seasonal Fruit',
      image: MEAL_IMAGES.puri_aloo_jalebi,
      calories: '801 kcal', protein: '14.4g', carbs: '133.3g', fats: '25.6g', fiber: '11.7g',
    },
    Lunch: {
      title: 'Chana Dal & Soyabean Shimla (Dry)',
      items: ['Chana Dal', 'Soyabean Shimla (Dry)', 'Rice', 'Roti', 'Curd', 'Mix Salad', 'Lemon 1/2'],
      servingSize: '150g Chana Dal, 150g Soyabean Shimla (Dry), 200g Cooked Rice, 200g Roti (4 pcs), 50g Curd, 50g Mix Salad, Lemon 1/2',
      image: MEAL_IMAGES.mix_dal_taroi,
      calories: '1051 kcal', protein: '44.5g', carbs: '182.8g', fats: '17.4g', fiber: '22.8g',
    },
    Snacks: {
      title: 'Namkeen Jave & Coffee',
      items: ['Namkeen Jave', 'Sauce', 'Coffee'],
      servingSize: '200g (1 bowl) Namkeen Jave, Sauce, 150ml Coffee',
      image: MEAL_IMAGES.macaroni,
      calories: '430 kcal', protein: '10.5g', carbs: '61g', fats: '15.5g', fiber: '3.2g',
    },
    Dinner: {
      title: 'Arhar Dal & Lauki',
      items: ['Arhar Dal', 'Lauki', 'Rice', 'Roti', 'Mix Salad'],
      servingSize: '150g Arhar Dal, 150g Lauki, 200g Cooked Rice, 200g Roti (4 pcs), 50g Mix Salad',
      image: MEAL_IMAGES.arhar_dal_lauki,
      calories: '940 kcal', protein: '30.3g', carbs: '179.5g', fats: '12.2g', fiber: '21.3g',
    },
  },
  Sunday: {
    Breakfast: {
      title: 'Aloo Sandwich & Cornflakes',
      items: ['Aloo Sandwich', 'Tomato Sauce', 'Cornflakes', 'Milk', 'Tea', 'Mix Fruit', 'Chaat Masala'],
      servingSize: 'Aloo Sandwich (1 serving), Tomato Sauce, 40g Cornflakes, 150ml Milk, 150ml Tea, 100g Mix Fruit, Chaat Masala',
      image: MEAL_IMAGES.aloo_sandwich,
      calories: '680 kcal', protein: '20.1g', carbs: '115g', fats: '15.6g', fiber: '10g',
    },
    Lunch: {
      title: 'Chhola Kabuli (BIG) & Bhature',
      items: ['Chhola Kabuli (BIG)', 'Bhature', 'Fry Mirch', 'Sirka Pyaz', 'Jeera Rice', 'Cold Drink', 'Veg Raita'],
      servingSize: '150g Chhola Kabuli (BIG), Bhature (2 pcs), Fried Mirchi, Sirka Pyaz, 200g Cooked Jeera Rice, 250ml Cold Drink, 50g Veg Raita',
      image: MEAL_IMAGES.chole_bhature,
      calories: '1120 kcal', protein: '30g', carbs: '189.5g', fats: '30g', fiber: '17.3g',
    },
    Snacks: {
      title: 'OFF',
      items: ['Mess Kitchen Closed on Sunday evening'],
      servingSize: 'OFF (0g)',
      image: '',
      calories: '0 kcal', protein: '0g', carbs: '0g', fats: '0g', fiber: '0g',
      status: 'off',
    },
    Dinner: {
      title: 'Kali Masoor Dal & Aloo Parval',
      items: ['Kali Masoor Dal', 'Aloo Parval', 'Rice', 'Roti', 'Kheer / Sewai'],
      servingSize: '150g Kali Masoor Dal, 150g Aloo Parval, 200g Cooked Rice, 200g Roti (4 pcs), 150g Kheer / Sewai',
      image: MEAL_IMAGES.kali_masoor_icecream,
      calories: '1190 kcal', protein: '36.4g', carbs: '220g', fats: '20.6g', fiber: '24.6g',
    },
  },
};

// Backward-compat alias — existing imports of BOYS_WEEKLY_MENU keep working
export const BOYS_WEEKLY_MENU = BOYS_JUNIOR_WEEKLY_MENU;

// ═══════════════════════════════════════════════════════════════════════════
//  BOYS SENIOR WEEKLY MENU
//  Caterer: Star Caterers (III Yr., IV Yr., MBA & MCA)
//  Effective: W.E.F. 24 Aug 2026
//  ABESEC & ABESBS, Ghaziabad
// ═══════════════════════════════════════════════════════════════════════════

export const BOYS_SENIOR_WEEKLY_MENU = {
  Monday: {
    Breakfast: {
      title: 'Matar Kulche & Tea',
      items: ['Matar Kulche', 'Tea', 'Milk', 'Banana'],
      servingSize: 'Matar Kulche (2 pcs) + 150g Matar Gravy, 150ml Tea, 150ml Milk, 1 Banana',
      image: MEAL_IMAGES.matar_kulche,
      calories: '590 kcal', protein: '18g', carbs: '93g', fats: '16g', fiber: '9g',
    },
    Lunch: {
      title: 'Mix Veg with Paneer & Arhar Dal',
      items: ['Mix Veg with Paneer', 'Arhar Dal', 'Rice', 'Roti', 'Boondi Raita', 'Salad', 'Lemon 1/2'],
      servingSize: '150g Mix Veg with Paneer, 150g Arhar Dal, 200g Cooked Rice, 200g Roti (4 pcs), 50g Boondi Raita, 50g Salad, Lemon 1/2',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '1050 kcal', protein: '37g', carbs: '188g', fats: '22g', fiber: '23g',
    },
    Snacks: {
      title: 'Aloo Patties & Tea',
      items: ['Aloo Patties', 'Tomato Sauce', 'Chilli Sauce', 'Tea'],
      servingSize: 'Aloo Patties (2 pcs), 20g Tomato & Chilli Sauce, 150ml Tea',
      image: MEAL_IMAGES.aloo_patties,
      calories: '480 kcal', protein: '10g', carbs: '65g', fats: '19g', fiber: '4g',
    },
    Dinner: {
      title: 'Aloo Tamatar Sabji & Aloo Parval Tamatar',
      items: ['Aloo Tamatar Sabji (Gravy)', 'Aloo Parval Tamatar (Dry)', 'Puri', 'Jeera Rice', 'Kheer', 'Mix Salad'],
      servingSize: '150g Aloo Tamatar Sabji, 150g Aloo Parval Tamatar (Dry), Puri (4 pcs), 200g Cooked Jeera Rice, 150g Kheer, 50g Mix Salad',
      image: MEAL_IMAGES.puri_aloo_jalebi,
      calories: '1340 kcal', protein: '32g', carbs: '235g', fats: '29g', fiber: '22g',
    },
  },
  Tuesday: {
    Breakfast: {
      title: 'Plain Paratha & Aloo Tamatar Sabji',
      items: ['Plain Paratha', 'Aloo Tamatar Sabji', 'Tea', 'Milk', 'Watermelon'],
      servingSize: 'Plain Paratha (2 pcs), 150g Aloo Tamatar Sabji, 150ml Tea, 150ml Milk, 100g Watermelon',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '580 kcal', protein: '16g', carbs: '90g', fats: '18g', fiber: '10g',
    },
    Lunch: {
      title: 'Aloo Beans & Rajma',
      items: ['Aloo Beans', 'Rajma', 'Roti', 'Rice', 'Curd', 'Salad', 'Lemon 1/2'],
      servingSize: '150g Aloo Beans, 150g Rajma, 200g Roti (4 pcs), 200g Cooked Rice, 50g Curd, 50g Salad, Lemon 1/2',
      image: MEAL_IMAGES.rajma_rice,
      calories: '1075 kcal', protein: '35g', carbs: '196g', fats: '18g', fiber: '25g',
    },
    Snacks: {
      title: 'Macroni / Chana Chaat & Coffee',
      items: ['Macroni / Chana Chaat', 'Chilli Sauce', 'Tomato Sauce', 'Coffee'],
      servingSize: '200g Macroni / Chana Chaat, 20g Sauce, 150ml Coffee',
      image: MEAL_IMAGES.macaroni,
      calories: '445 kcal', protein: '13g', carbs: '69g', fats: '13g', fiber: '6g',
    },
    Dinner: {
      title: 'Arhar Dal & Bhindi',
      items: ['Arhar Dal', 'Bhindi', 'Rice', 'Roti', 'Gulab Jamun', 'Chhachh'],
      servingSize: '150g Arhar Dal, 150g Bhindi, 200g Cooked Rice, 200g Roti (4 pcs), Gulab Jamun (1 pc), 200ml Chhachh',
      image: MEAL_IMAGES.arhar_dal_lauki,
      calories: '1160 kcal', protein: '34g', carbs: '206g', fats: '22g', fiber: '25g',
    },
  },
  Wednesday: {
    Breakfast: {
      title: 'Pav Bhaji & Tea',
      items: ['Pav Bhaji', 'Butter', 'Tea', 'Milk', 'Pear'],
      servingSize: '2 pav + 200g bhaji, Butter, 150ml Tea, 150ml Milk, 1 Pear',
      image: MEAL_IMAGES.pav_bhaji,
      calories: '760 kcal', protein: '21g', carbs: '104g', fats: '28g', fiber: '11g',
    },
    Lunch: {
      title: 'Aloo Pyaaj Sabji & Kadhi',
      items: ['Aloo Pyaaj Sabji', 'Kadhi', 'Rice', 'Roti', 'Salad', 'Fry Papad', 'Lemon 1/2'],
      servingSize: '150g Aloo Pyaaj Sabji, 150g Kadhi, 200g Cooked Rice, 200g Roti (4 pcs), 50g Salad, 1 Fried Papad, Lemon 1/2',
      image: MEAL_IMAGES.kadhi_rice,
      calories: '1005 kcal', protein: '27g', carbs: '183g', fats: '18g', fiber: '19g',
    },
    Snacks: {
      title: 'Burger & Coffee',
      items: ['Burger', 'Chilli Sauce', 'Tomato Sauce', 'Coffee'],
      servingSize: '1 pc Burger, 20g Sauce, 150ml Coffee',
      image: MEAL_IMAGES.burger,
      calories: '530 kcal', protein: '16g', carbs: '65g', fats: '22g', fiber: '3g',
    },
    Dinner: {
      title: 'Kala Chana & Mix Veg',
      items: ['Kala Chana', 'Mix Veg', 'Roti', 'Rice', 'Custard', 'Mix Salad'],
      servingSize: '150g Kala Chana, 150g Mix Veg, 200g Roti (4 pcs), 200g Cooked Rice, 150g Custard, 50g Mix Salad',
      image: MEAL_IMAGES.chhole_rice,
      calories: '1210 kcal', protein: '36g', carbs: '215g', fats: '24g', fiber: '28g',
    },
  },
  Thursday: {
    Breakfast: {
      title: 'Aloo Pyaj Paratha & Curd',
      items: ['Aloo Pyaj Paratha', 'Curd', 'Pickle', 'Tea', 'Papaya'],
      servingSize: 'Aloo Pyaj Paratha (2 pcs), 50g Curd, Pickle, 150ml Tea, 100g Papaya',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '555 kcal', protein: '15g', carbs: '83g', fats: '19g', fiber: '10g',
    },
    Lunch: {
      title: 'Aloo Dum & Arhar Dal',
      items: ['Aloo Dum', 'Arhar Dal', 'Roti', 'Rice', 'Boodi Raita', 'Mix Salad', 'Lemon 1/2'],
      servingSize: '150g Aloo Dum, 150g Arhar Dal, 200g Roti (4 pcs), 200g Cooked Rice, 50g Boondi Raita, 50g Mix Salad, Lemon 1/2',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '1060 kcal', protein: '30g', carbs: '193g', fats: '19g', fiber: '22g',
    },
    Snacks: {
      title: 'Bread Pakoda & Tea',
      items: ['Bread Pakoda', 'Hari Chutney', 'Saunth', 'Tea'],
      servingSize: 'Bread Pakoda (2 pcs), Hari Chutney, Saunth, 150ml Tea',
      image: MEAL_IMAGES.pakoda,
      calories: '410 kcal', protein: '10g', carbs: '52g', fats: '17g', fiber: '3g',
    },
    Dinner: {
      title: 'Kadhai / Matar Paneer & Aloo Chokha',
      items: ['Kadhai / Matar Paneer', 'Aloo Chokha', 'Jeera Rice', 'Roti / Puri', 'Masala Mirch', 'Sirka Pyaj'],
      servingSize: '150g Kadhai/Matar Paneer, 150g Aloo Chokha, 200g Cooked Jeera Rice, Roti (4 pcs) / Puri (4 pcs), Masala Mirch, Sirka Pyaj',
      image: MEAL_IMAGES.butter_paneer_puri,
      calories: '1290 kcal', protein: '38g', carbs: '215g', fats: '36g', fiber: '19g',
    },
  },
  Friday: {
    Breakfast: {
      title: 'Veg Fried Idli & Plain Idli',
      items: ['Veg Fried Idli', 'Plain Idli', 'Sambhar', 'Coconut Chutney', 'Tea', 'Milk', 'Banana'],
      servingSize: 'Fried Idli (3 pcs), Plain Idli (3 pcs), 150g Sambhar, 50g Coconut Chutney, 150ml Tea, 150ml Milk, 1 Banana',
      image: MEAL_IMAGES.idli_sambhar,
      calories: '598 kcal', protein: '20g', carbs: '81g', fats: '22g', fiber: '8g',
    },
    Lunch: {
      title: 'Chhole & Kashifal',
      items: ['Chhole', 'Kashifal', 'Roti', 'Jeera Rice', 'Curd', 'Mix Salad', 'Lemon 1/2'],
      servingSize: '150g Chhole, 150g Kashifal, 200g Roti (4 pcs), 200g Cooked Jeera Rice, 50g Curd, 50g Mix Salad, Lemon 1/2',
      image: MEAL_IMAGES.chhole_rice,
      calories: '1088 kcal', protein: '33g', carbs: '198g', fats: '20g', fiber: '26g',
    },
    Snacks: {
      title: 'Chaat Papdi & Tea',
      items: ['Chaat Papdi', 'Tea'],
      servingSize: '150g Chaat Papdi, 150ml Tea',
      image: MEAL_IMAGES.macaroni,
      calories: '400 kcal', protein: '9g', carbs: '60g', fats: '14g', fiber: '5g',
    },
    Dinner: {
      title: 'Dal Makhni & Dry Arbi',
      items: ['Dal Makhni', 'Dry Arbi', 'Rice', 'Roti', 'Ice Cream / Mutter Mushroom', 'Moog Dal Halwa (Once in a Month)', 'Mix Salad'],
      servingSize: '150g Dal Makhni, 150g Dry Arbi, 200g Cooked Rice, 200g Roti (4 pcs), 60g Ice Cream / 150g Mutter Mushroom, 50g Mix Salad',
      image: MEAL_IMAGES.dal_makhani_thali,
      calories: '1250 kcal', protein: '34g', carbs: '213g', fats: '30g', fiber: '24g',
    },
  },
  Saturday: {
    Breakfast: {
      title: 'Aloo Tamatar Sabji, Ajwain Puri & Jalebi',
      items: ['Aloo Tamatar Sabji', 'Ajwain Puri', 'Tea', 'Jalebi', 'Curd', 'Pickle'],
      servingSize: '150g Aloo Tamatar Sabji, Ajwain Puri (4 pcs), 150ml Tea, Jalebi (2 pcs), 50g Curd, Pickle',
      image: MEAL_IMAGES.puri_aloo_jalebi,
      calories: '795 kcal', protein: '14g', carbs: '130g', fats: '25g', fiber: '11g',
    },
    Lunch: {
      title: 'Rajma & Aloo Matar (Dry)',
      items: ['Rajma', 'Aloo Matar (Dry)', 'Rice', 'Roti', 'Curd', 'Mix Salad', 'Lemon 1/2'],
      servingSize: '150g Rajma, 150g Aloo Matar (Dry), 200g Cooked Rice, 200g Roti (4 pcs), 50g Curd, 50g Mix Salad, Lemon 1/2',
      image: MEAL_IMAGES.rajma_rice,
      calories: '1070 kcal', protein: '36g', carbs: '192g', fats: '18g', fiber: '26g',
    },
    Snacks: {
      title: 'Samosa & Tea',
      items: ['Samosa', 'Hari Chutney', 'Sounth', 'Tea'],
      servingSize: 'Samosa (1 pc), Hari Chutney, Sounth, 150ml Tea',
      image: MEAL_IMAGES.samosa,
      calories: '380 kcal', protein: '8g', carbs: '48g', fats: '17g', fiber: '4g',
    },
    Dinner: {
      title: 'Chana Dal & Aloo Soyabean',
      items: ['Chana Dal', 'Aloo Soyabean', 'Rice', 'Roti', 'Chhach'],
      servingSize: '150g Chana Dal, 150g Aloo Soyabean, 200g Cooked Rice, 200g Roti (4 pcs), 200ml Chhach',
      image: MEAL_IMAGES.mix_dal_taroi,
      calories: '1040 kcal', protein: '37g', carbs: '183g', fats: '16g', fiber: '25g',
    },
  },
  Sunday: {
    Breakfast: {
      title: 'Aloo Paratha & Hari Chutney',
      items: ['Aloo Paratha', 'Hari Chutney (Tomato+Hari Dhaniya)', 'Tomato Sauce', 'Curd', 'Tea', 'Watermelon'],
      servingSize: 'Aloo Paratha (2 pcs), Hari Chutney, Tomato Sauce, 50g Curd, 150ml Tea, 100g Watermelon',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '620 kcal', protein: '17g', carbs: '94g', fats: '20g', fiber: '10g',
    },
    Lunch: {
      title: 'Chhole Bhature & Jeera Rice',
      items: ['Chhole', 'Bhature', 'Jeera Rice', 'Sirka Pyaz', 'Pudina Raita', 'Cold Drink', 'Achar'],
      servingSize: '150g Chhole, Bhature (2 pcs), 200g Cooked Jeera Rice, Sirka Pyaz, 50g Pudina Raita, 250ml Cold Drink, Achar',
      image: MEAL_IMAGES.chole_bhature,
      calories: '1130 kcal', protein: '31g', carbs: '192g', fats: '30g', fiber: '18g',
    },
    Snacks: {
      title: 'OFF',
      items: ['Mess Kitchen Closed on Sunday evening'],
      servingSize: 'OFF (0g)',
      image: '',
      calories: '0 kcal', protein: '0g', carbs: '0g', fats: '0g', fiber: '0g',
      status: 'off',
    },
    Dinner: {
      title: 'Fried Rice & Manchurian',
      items: ['Fried Rice', 'Manchurian', 'Roti', 'Taro', 'Gulab Jamun / Besan Ladoo / Coconut Ladoo', 'Chhach'],
      servingSize: '200g Fried Rice, 150g Manchurian, 200g Roti (4 pcs), 150g Taro, Gulab Jamun (1 pc) / Laddoo (1 pc), 200ml Chhach',
      image: MEAL_IMAGES.kali_masoor_icecream,
      calories: '1290 kcal', protein: '30g', carbs: '225g', fats: '32g', fiber: '18g',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
//  GIRLS HOSTEL WEEKLY MENU
//  Session 2026-27, V-01
//  Effective: W.E.F. 19 Sept 2026
//  ABES EC & ABES BS, Ghaziabd
// ═══════════════════════════════════════════════════════════════════════════

export const GIRLS_WEEKLY_MENU = {
  Monday: {
    Breakfast: {
      title: 'Fried Idli, Sambar & Nariyal Chatni',
      items: ['Fried Idli', 'Sambar', 'Nariyal Chatni', 'Tea with Ginger', 'Milk', 'Banana'],
      servingSize: 'Fried Idli (3 pcs), 150g Sambar, 50g Nariyal Chatni, 150ml Tea with Ginger, 150ml Milk, 1 Banana',
      image: GH_IMAGES.fried_idli,
      calories: '540 kcal', protein: '18g', carbs: '78g', fats: '16g', fiber: '8g',
    },
    Lunch: {
      title: 'Arhar Daal & Mix Veg with Paneer',
      items: ['Arhar Daal', 'Mix Veg with Paneer', 'Boondi Raita', 'Rice', 'Chapati', 'Salad with Onion', '1/2 Lemon'],
      servingSize: '150g Arhar Daal, 150g Mix Veg with Paneer (min 15% paneer), 50g Boondi Raita, 200g Cooked Rice, Chapati (3 pcs), 50g Salad, 1/2 Lemon',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '930 kcal', protein: '33g', carbs: '162g', fats: '20g', fiber: '20g',
    },
    Snacks: {
      title: 'Bread Pakoda / Mix Pakodi & Tea',
      items: ['Bread Pakoda / Mix Pakodi', 'Tomato Sauce', 'Green Chatni', 'Tea'],
      servingSize: 'Bread Pakoda (2 pcs) / Mix Pakodi (1 bowl), 20g Sauce, 20g Green Chatni, 150ml Tea',
      image: MEAL_IMAGES.pakoda,
      calories: '390 kcal', protein: '9g', carbs: '51g', fats: '16g', fiber: '4g',
    },
    Dinner: {
      title: 'Shahi Paneer / Kadhai Paneer',
      items: ['Shahi Paneer / Kadhai Paneer', 'Aloo Chokha', 'Chapati', 'Rice', 'Mix Salad', 'Sweet Corn Soup'],
      servingSize: '150g Shahi/Kadhai Paneer, 150g Aloo Chokha, Chapati (3 pcs), 200g Cooked Rice, 50g Mix Salad, 200ml Sweet Corn Soup',
      image: GH_IMAGES.shahi_paneer,
      calories: '1050 kcal', protein: '36g', carbs: '168g', fats: '30g', fiber: '15g',
    },
  },
  Tuesday: {
    Breakfast: {
      title: 'Plain / Methi Parantha & Aloo Tomato Sabji',
      items: ['Plain / Methi Parantha', 'Aloo Tomato Sabji', 'Tea with Ginger', 'Milk', 'Pickle', 'Watermelon / Seasonal Fruit'],
      servingSize: 'Parantha (2 pcs), 150g Aloo Tomato Sabji, 150ml Tea with Ginger, 150ml Milk, Pickle, 100g Seasonal Fruit',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '570 kcal', protein: '16g', carbs: '87g', fats: '18g', fiber: '11g',
    },
    Lunch: {
      title: 'Rajma & Aloo Beans / Seasonal Veg',
      items: ['Rajma', 'Aloo Beans / Seasonal Veg', 'Chapati', 'Rice', 'Curd', 'Beetroot Salad with Onion', '1/2 Lemon'],
      servingSize: '150g Rajma, 150g Aloo Beans/Seasonal Veg, Chapati (3 pcs), 200g Cooked Rice, 50g Curd, 50g Beetroot Salad, 1/2 Lemon',
      image: MEAL_IMAGES.rajma_rice,
      calories: '910 kcal', protein: '32g', carbs: '159g', fats: '16g', fiber: '23g',
    },
    Snacks: {
      title: 'Chowmein & Coffee',
      items: ['Chowmein', 'Tomato Sauce', 'Green Chilli Sauce', 'Coffee'],
      servingSize: '200g (1 bowl) Chowmein, 20g Sauce, 150ml Coffee',
      image: MEAL_IMAGES.chowmein,
      calories: '410 kcal', protein: '11g', carbs: '65g', fats: '13g', fiber: '4g',
    },
    Dinner: {
      title: 'Sabut Masoor Daal & Aloo Palak',
      items: ['Sabut Masoor Daal', 'Aloo Palak / Seasonal Veg', 'Chapati', 'Rice', 'Gulab Jamun', 'Chhach / Tomato Soup'],
      servingSize: '150g Sabut Masoor Daal, 150g Aloo Palak/Seasonal Veg, Chapati (3 pcs), 200g Cooked Rice, Gulab Jamun (1 pc), 200ml Chhach/Tomato Soup',
      image: MEAL_IMAGES.mix_dal_taroi,
      calories: '1000 kcal', protein: '31g', carbs: '175g', fats: '18g', fiber: '22g',
    },
  },
  Wednesday: {
    Breakfast: {
      title: 'Bread, Amul Butter & Jam with Cornflakes',
      items: ['Bread', 'Amul Butter', 'Jam', 'Cornflakes', 'Tea with Ginger', 'Milk', 'Banana'],
      servingSize: '4 slices Bread, Amul Butter, Jam, 40g Cornflakes, 150ml Tea with Ginger, 150ml Milk, 1 Banana',
      image: GH_IMAGES.bread_butter_cornflakes,
      calories: '520 kcal', protein: '14g', carbs: '85g', fats: '14g', fiber: '5g',
    },
    Lunch: {
      title: 'Kadhi & Aloo Jeera / Seasonal Veg',
      items: ['Kadhi (without Tomato & Less Onion)', 'Aloo Jeera / Seasonal Veg', 'Chapati', 'Rice', 'Fried Mirchi', 'Papad', 'Masala Onion Laccha', '1/2 Lemon'],
      servingSize: '150g Kadhi, 150g Aloo Jeera/Seasonal Veg, Chapati (3 pcs), 200g Cooked Rice, Fried Mirchi, 1 Papad, 50g Masala Onion Laccha, 1/2 Lemon',
      image: MEAL_IMAGES.kadhi_rice,
      calories: '890 kcal', protein: '25g', carbs: '157g', fats: '18g', fiber: '17g',
    },
    Snacks: {
      title: 'Poha / Rusk & Tea',
      items: ['Poha / Rusk', 'Tomato Sauce', 'Green Chilli Sauce', 'Tea'],
      servingSize: '200g Poha / Rusk (2 pcs), 20g Sauce, 150ml Tea',
      image: MEAL_IMAGES.macaroni,
      calories: '340 kcal', protein: '8g', carbs: '56g', fats: '10g', fiber: '3g',
    },
    Dinner: {
      title: 'Manchoorian & Aloo Tikki / Mix Daal & Aloo Baingan',
      items: [
        '1. Manchoorian + Aloo Tikki with Matra + Curd + Saunth + Fried Rice + Cold Drink (Once in a Month)',
        '2. Mix Daal + Aloo Baingan + Plain Rice + Chapati + Fruit Custard + Mix Salad',
      ],
      servingSize: '150g Manchoorian/Mix Daal, 150g Aloo Tikki/Aloo Baingan, Chapati (3 pcs), 200g Fried/Plain Rice, 150g Fruit Custard / 250ml Cold Drink, 50g Mix Salad',
      image: GH_IMAGES.manchurian_rice,
      calories: '1080 kcal', protein: '28g', carbs: '189g', fats: '26g', fiber: '18g',
      alternatives: [
        'Manchoorian + Aloo Tikki with Matra + Curd + Saunth + Fried Rice + Cold Drink (Monthly)',
        'Mix Daal + Aloo Baingan + Plain Rice + Chapati + Fruit Custard + Mix Salad',
      ],
    },
  },
  Thursday: {
    Breakfast: {
      title: 'Matar Kulcha & Tea',
      items: ['Matar Kulcha', 'Tea with Ginger', 'Milk', 'Papaya / Seasonal Fruit'],
      servingSize: 'Matar Kulcha (2 pcs) + 150g Matar Gravy, 150ml Tea with Ginger, 150ml Milk, 100g Papaya/Seasonal Fruit',
      image: MEAL_IMAGES.matar_kulche,
      calories: '575 kcal', protein: '17g', carbs: '89g', fats: '15g', fiber: '9g',
    },
    Lunch: {
      title: 'Arhar Daal & Mix Veg',
      items: ['Arhar Daal', 'Mix Veg', 'Boondi Raita', 'Chapati', 'Rice', 'Salad with Onion', '1/2 Lemon'],
      servingSize: '150g Arhar Daal, 150g Mix Veg, 50g Boondi Raita, Chapati (3 pcs), 200g Cooked Rice, 50g Salad, 1/2 Lemon',
      image: MEAL_IMAGES.arhar_dal_thali,
      calories: '890 kcal', protein: '28g', carbs: '157g', fats: '18g', fiber: '19g',
    },
    Snacks: {
      title: 'Macroni & Coffee',
      items: ['Macroni', 'Tomato Sauce', 'Green Chilli Sauce', 'Coffee'],
      servingSize: '200g (1 bowl) Macroni, 20g Sauce, 150ml Coffee',
      image: MEAL_IMAGES.macaroni,
      calories: '400 kcal', protein: '10g', carbs: '64g', fats: '12g', fiber: '3g',
    },
    Dinner: {
      title: 'Chhole Masala & Aloo Shimla Mirch',
      items: ['Chhole Masala', 'Aloo Shimla Mirch', 'Chapati', 'Rice', 'Salad with Onion'],
      servingSize: '150g Chhole Masala, 150g Aloo Shimla Mirch, Chapati (3 pcs), 200g Cooked Rice, 50g Salad with Onion',
      image: MEAL_IMAGES.chhole_rice,
      calories: '1020 kcal', protein: '33g', carbs: '178g', fats: '20g', fiber: '24g',
    },
  },
  Friday: {
    Breakfast: {
      title: 'Aloo Sandwich & Tea',
      items: ['Aloo Sandwich', 'Tomato Sauce', 'Tea with Ginger', 'Milk', 'Banana / Seasonal Fruit'],
      servingSize: 'Aloo Sandwich (1 serving), 20g Tomato Sauce, 150ml Tea with Ginger, 150ml Milk, 100g Seasonal Fruit',
      image: MEAL_IMAGES.aloo_sandwich,
      calories: '530 kcal', protein: '14g', carbs: '84g', fats: '14g', fiber: '8g',
    },
    Lunch: {
      title: 'Lauki Kofta & Aloo Jeera (Kasuri Methi)',
      items: ['Lauki Kofta', 'Aloo Jeera with Kasuri Methi / Seasonal Veg', 'Chapati', 'Rice', 'Curd', 'Beetroot Salad', '1/2 Lemon'],
      servingSize: '150g Lauki Kofta, 150g Aloo Jeera with Kasuri Methi, Chapati (3 pcs), 200g Cooked Rice, 50g Curd, 50g Beetroot Salad, 1/2 Lemon',
      image: MEAL_IMAGES.lauki_kofta_kheer,
      calories: '880 kcal', protein: '26g', carbs: '154g', fats: '18g', fiber: '19g',
    },
    Snacks: {
      title: 'Papdi Chaat & Roohafza',
      items: ['Papdi Chaat', 'Tomato Sauce', 'Green Chilli Sauce', 'Roohafza'],
      servingSize: '150g Papdi Chaat, 20g Sauce, 150ml Roohafza',
      image: GH_IMAGES.papdi_chaat,
      calories: '380 kcal', protein: '9g', carbs: '62g', fats: '12g', fiber: '5g',
    },
    Dinner: {
      title: 'Chana Daal & Aloo Parmal / Matar Mushroom',
      items: ['Chana Daal', 'Aloo Parmal / Matar Mushroom', 'Chapati', 'Rice', 'Ice Cream / Moong Daal Halwa (Once in a Month)', 'Mix Salad'],
      servingSize: '150g Chana Daal, 150g Aloo Parmal/Matar Mushroom, Chapati (3 pcs), 200g Cooked Rice, 60g Ice Cream / 100g Moong Daal Halwa (Monthly), 50g Mix Salad',
      image: MEAL_IMAGES.dal_makhani_thali,
      calories: '1010 kcal', protein: '30g', carbs: '176g', fats: '22g', fiber: '22g',
      monthlySpecial: 'Moong Daal Halwa (Once in a Month)',
    },
  },
  Saturday: {
    Breakfast: {
      title: 'Aloo Tomato Sabji (Bhandara) & Poori',
      items: ['Aloo Tomato Sabji (Bhandara)', 'Plain Poori / Palak Poori', 'Tea with Ginger', 'Milk', 'Pickle', 'Papaya / Seasonal Fruit', 'Jalebi'],
      servingSize: '150g Aloo Tomato Sabji, Plain/Palak Poori (4 pcs), 150ml Tea with Ginger, 150ml Milk, Pickle, 100g Seasonal Fruit, Jalebi (2 pcs)',
      image: GH_IMAGES.palak_poori,
      calories: '820 kcal', protein: '16g', carbs: '136g', fats: '25g', fiber: '12g',
    },
    Lunch: {
      title: 'Mix Daal & Aloo Soyabean / Seasonal Veg',
      items: ['Mix Daal', 'Aloo Soyabean / Seasonal Veg', 'Chapati', 'Rice', 'Veg Raita', 'Salad with Onion', '1/2 Lemon'],
      servingSize: '150g Mix Daal, 150g Aloo Soyabean/Seasonal Veg, Chapati (3 pcs), 200g Cooked Rice, 50g Veg Raita, 50g Salad with Onion, 1/2 Lemon',
      image: MEAL_IMAGES.mix_dal_taroi,
      calories: '890 kcal', protein: '30g', carbs: '155g', fats: '17g', fiber: '21g',
    },
    Snacks: {
      title: 'Samosa (1 Pc BIG SIZE) & Tea',
      items: ['Samosa (1 Pc BIG SIZE)', 'Saunth', 'Green Chatni', 'Tea'],
      servingSize: 'BIG Samosa (1 pc), Saunth, Green Chatni, 150ml Tea',
      image: MEAL_IMAGES.samosa,
      calories: '370 kcal', protein: '8g', carbs: '48g', fats: '16g', fiber: '4g',
    },
    Dinner: {
      title: 'Rajma & Tehri with Soyabeen',
      items: ['Rajma', 'Tehri with Soyabeen', 'Chapati', 'Chutney', 'Chhach / Mix Veg Soup'],
      servingSize: '150g Rajma, 200g Tehri with Soyabeen, Chapati (3 pcs), 50g Chutney, 200ml Chhach/Mix Veg Soup',
      image: MEAL_IMAGES.rajma_rice,
      calories: '990 kcal', protein: '32g', carbs: '171g', fats: '18g', fiber: '24g',
    },
  },
  Sunday: {
    Breakfast: {
      title: 'Aloo Onion / Gobhi Prantha & Tea',
      items: ['Aloo Onion / Gobhi Prantha', 'Green Chatni', 'Tea with Ginger', 'Milk', 'Pickle', 'Watermelon / Seasonal Fruit'],
      servingSize: 'Prantha (2 pcs), Green Chatni, 150ml Tea with Ginger, 150ml Milk, Pickle, 100g Seasonal Fruit',
      image: MEAL_IMAGES.aloo_paratha,
      calories: '560 kcal', protein: '15g', carbs: '85g', fats: '17g', fiber: '10g',
    },
    Lunch: {
      title: 'Chhole Bhature & Jeera Rice',
      items: ['Chhole', 'Bhature', 'Jeera Rice', 'Fried Mirchi', 'Masala Onion Laccha', '1/2 Lemon', 'Cold Drink / Pudina Raita'],
      servingSize: '150g Chhole, Bhature (2 pcs), 200g Cooked Jeera Rice, Fried Mirchi, 50g Masala Onion Laccha, 1/2 Lemon, 250ml Cold Drink / 50g Pudina Raita',
      image: MEAL_IMAGES.chole_bhature,
      calories: '1080 kcal', protein: '29g', carbs: '183g', fats: '29g', fiber: '18g',
    },
    Snacks: {
      title: 'OFF',
      items: ['Mess Kitchen Closed on Sunday evening'],
      servingSize: 'OFF (0g)',
      image: '',
      calories: '0 kcal', protein: '0g', carbs: '0g', fats: '0g', fiber: '0g',
      status: 'off',
    },
    Dinner: {
      title: 'Kadhi Pakora & Aloo Pyaz',
      items: ['Kadhi Pakora', 'Aloo Pyaz', 'Chapati', 'Rice', 'Suji Halwa', 'Mix Salad'],
      servingSize: '150g Kadhi Pakora, 150g Aloo Pyaz, Chapati (3 pcs), 200g Cooked Rice, 100g Suji Halwa, 50g Mix Salad',
      image: GH_IMAGES.kadhi_pakora,
      calories: '1040 kcal', protein: '28g', carbs: '183g', fats: '23g', fiber: '18g',
    },
  },
};

// ── ROUTING HELPERS ──────────────────────────────────────────────────────────

/**
 * Get the weekly menu dataset for a given mess ID.
 * Central single source of truth for mess → menu resolution.
 *
 * @param {string} messId - 'boys_junior' | 'boys_senior' | 'girls'
 * @returns {object} Weekly menu dataset
 */
export const getMenuByMessId = (messId) => {
  switch (messId) {
    case 'boys_senior': return BOYS_SENIOR_WEEKLY_MENU;
    case 'girls':       return GIRLS_WEEKLY_MENU;
    case 'boys_junior': return BOYS_JUNIOR_WEEKLY_MENU;
    default:            return null;
  }
};

/**
 * Get the weekly menu for a hostel block (backward compat).
 * @param {string} hostelBlock
 * @param {string} [messId] - optional override
 */
export const getHostelMenu = (hostelBlock, messId) => {
  if (messId) return getMenuByMessId(messId);
  if (isGirlsHostelBlock(hostelBlock)) return GIRLS_WEEKLY_MENU;
  return BOYS_JUNIOR_WEEKLY_MENU; // default boys = junior
};

/**
 * Get today's meals as objects for a given mess ID and day name.
 * Used by officials dashboard.
 *
 * @param {string} dayName
 * @param {string} hostelBlock - for backward compat
 * @param {string} [messId]    - preferred; overrides hostelBlock
 */
export const getTodayHostelMeals = (dayName, hostelBlock, messId) => {
  const menuData = messId ? getMenuByMessId(messId) : getHostelMenu(hostelBlock);
  const dayMenu = menuData[dayName] || menuData['Monday'];
  const mealCategories = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

  return mealCategories.map(cat => {
    const meal = dayMenu[cat] || { title: `${cat} Special`, items: [], image: '', protein: '12g', calories: '400 kcal' };
    const scopePrefix = messId || (isGirlsHostelBlock(hostelBlock) ? 'girls' : 'boys_junior');
    return {
      id: `${scopePrefix}_${dayName}_${cat}`.toLowerCase().replace(/\s+/g, '_'),
      name: meal.title,
      category: cat,
      day: dayName,
      description: meal.items?.join(', ') || '',
      items: meal.items || [],
      imageUrl: meal.image || '',
      image: meal.image || '',
      protein: meal.protein || '12g',
      calories: meal.calories || '400 kcal',
      carbs: meal.carbs || '',
      fats: meal.fats || '',
      fiber: meal.fiber || '',
      servingSize: meal.servingSize || '',
      status: meal.status || 'active',
      isVeg: true,
      special: !!(meal.monthlySpecial || meal.alternatives),
    };
  });
};
