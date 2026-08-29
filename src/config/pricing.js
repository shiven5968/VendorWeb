/**
 * Official Muscle Pass Subscription Plans & Pricing Configuration
 * 
 * Plans:
 * 1. Monthly: ₹69 / month (30 days)
 * 2. 3 Months: ₹149 / 3 months (90 days)
 * 3. 6 Months: ₹249 / 6 months (180 days)
 * 4. 1 Year: ₹449 / year (365 days)
 */

export const MUSCLE_PASS_PLANS = {
  MUSCLE_MONTHLY: {
    id: 'MUSCLE_MONTHLY',
    name: 'Monthly Plan',
    durationLabel: '1 Month',
    durationMonths: 1,
    durationDays: 30,
    price: 69,
    pricePerMonth: 69,
    amountPaise: 6900,
    currency: 'INR',
    popular: false,
    badge: 'Starter',
    tagline: 'Ideal for trial & monthly routine',
    description: 'Personalized daily protein goal slider, mess menu macro breakdown, and high-protein dish tracking.'
  },
  MUSCLE_3_MONTHS: {
    id: 'MUSCLE_3_MONTHS',
    name: '3 Months Plan',
    durationLabel: '3 Months',
    durationMonths: 3,
    durationDays: 90,
    price: 149,
    pricePerMonth: 50,
    amountPaise: 14900,
    currency: 'INR',
    popular: true,
    badge: 'Most Popular',
    savingsLabel: 'Save 28%',
    tagline: 'Quarterly fitness transformation',
    description: 'Quarterly high-protein tracking, personalized target adjustments, and meal logging.'
  },
  MUSCLE_6_MONTHS: {
    id: 'MUSCLE_6_MONTHS',
    name: '6 Months Plan',
    durationLabel: '6 Months',
    durationMonths: 6,
    durationDays: 180,
    price: 249,
    pricePerMonth: 42,
    amountPaise: 24900,
    currency: 'INR',
    popular: false,
    badge: 'Semester Pass',
    savingsLabel: 'Save 40%',
    tagline: 'Full semester gym routine',
    description: 'Continuous semester-long protein analytics, priority nutrition logs, and high-protein recommendations.'
  },
  MUSCLE_YEARLY: {
    id: 'MUSCLE_YEARLY',
    name: '1 Year Plan',
    durationLabel: '1 Year (12 Months)',
    durationMonths: 12,
    durationDays: 365,
    price: 449,
    pricePerMonth: 37,
    amountPaise: 44900,
    currency: 'INR',
    popular: false,
    badge: 'Best Value',
    savingsLabel: 'Save 46%',
    tagline: 'Year-round uninterrupted access',
    description: 'Complete annual gym mode access with continuous mess nutrition planning and tracking.'
  }
};

export const MUSCLE_PASS_PLAN_LIST = [
  MUSCLE_PASS_PLANS.MUSCLE_MONTHLY,
  MUSCLE_PASS_PLANS.MUSCLE_3_MONTHS,
  MUSCLE_PASS_PLANS.MUSCLE_6_MONTHS,
  MUSCLE_PASS_PLANS.MUSCLE_YEARLY
];

export const getMusclePassPlan = (planId) => {
  return MUSCLE_PASS_PLANS[planId] || MUSCLE_PASS_PLANS.MUSCLE_MONTHLY;
};
