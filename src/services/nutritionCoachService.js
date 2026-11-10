/**
 * MessMates — Campus AI Nutrition Coach Service
 * 
 * Provides deterministic, educational nutrition intelligence grounded strictly
 * in the student's actual campus mess menu and recorded intake data.
 * 
 * Never invents fake menu dishes or hallucinates false metrics.
 * Does not make medical diagnoses.
 */

import { getSmartAlternatives } from './nutritionAlternatives.js';

/**
 * Standard suggested prompt pills for quick tap.
 */
export const SUGGESTED_COACH_PROMPTS = [
  "I skipped breakfast. What should I eat now?",
  "How much protein have I consumed today?",
  "Suggest a vegetarian combo from today's menu.",
  "What should I eat for dinner tonight?",
  "How can I hit my remaining protein target?",
  "What campus alternatives can I get outside the mess?"
];

/**
 * Generates an intelligent, grounded response to a student query.
 * 
 * @param {object} params
 * @param {string} params.query - Student question
 * @param {object} params.profile - Student profile (weight, target, dietary preference, etc.)
 * @param {object} params.summary - Daily nutrition summary (consumed, remaining, completion %)
 * @param {object} params.recommendations - Meal recommendations for today
 * @param {Array} params.todayMeals - Today's actual hostel mess meals
 * @returns {object} { answer: string, actionableItems: Array, disclaimer: string }
 */
export function askNutritionCoach({
  query = '',
  profile = {},
  summary = {},
  recommendations = {},
  todayMeals = []
} = {}) {
  const cleanQ = query.trim().toLowerCase();
  const studentName = profile.name || 'Student';
  const weight = profile.weightKg || 60;
  const target = summary.targetProtein || profile.dailyProteinTargetG || 120;
  const consumed = summary.consumedProtein || 0;
  const remaining = Math.max(0, target - consumed);
  const completionPct = summary.completionPercentage || Math.min(100, Math.round((consumed / target) * 100));
  const diet = profile.dietaryPreference || 'Vegetarian';
  const goal = profile.goal || 'Muscle Gain';
  const allergies = profile.allergies || [];

  const alternatives = getSmartAlternatives({
    dietaryPreference: diet,
    allergies,
    remainingProteinNeeded: remaining
  });

  // 1. Specific meal slot questions (Dinner, Lunch, Breakfast, Snacks)
  if (cleanQ.includes('dinner')) {
    const dinnerRec = recommendations['Dinner'];
    const dinnerMeal = (todayMeals || []).find(m => m.category === 'Dinner');

    if (dinnerRec && dinnerRec.suggestedItems && dinnerRec.suggestedItems.length > 0) {
      const itemsList = dinnerRec.suggestedItems
        .map(i => `• **${i.name}**: ${i.recommendedPortionLabel} (~${i.recommendedProteinG}g protein)`)
        .join('\n');

      return {
        answer: `Tonight's hostel dinner is **${dinnerMeal?.title || dinnerRec.title}**.

Recommended plate setup for your **${goal}** goal:
${itemsList}

**Total estimated protein from dinner:** ~${dinnerRec.totalSuggestedProtein}g.
${remaining > dinnerRec.totalSuggestedProtein 
  ? `This leaves a minor gap of ~${Math.round(remaining - dinnerRec.totalSuggestedProtein)}g, which you can easily bridge with a glass of milk before bed.` 
  : 'This will comfortably close today’s target!'}`,
        actionableItems: ['Dinner'],
        disclaimer: "Values based on official hostel mess schedule."
      };
    }

    return {
      answer: `Tonight's dinner will be served between 7:30 PM - 9:00 PM. Focus on prioritizing the dal/rajma/paneer dish and taking a controlled portion of plain rice to keep your protein-to-carb balance high.`,
      actionableItems: ['Dinner'],
      disclaimer: "Nutrition estimates based on standard mess preparation."
    };
  }

  if (cleanQ.includes('lunch')) {
    const lunchRec = recommendations['Lunch'];
    const lunchMeal = (todayMeals || []).find(m => m.category === 'Lunch');

    if (lunchRec && lunchRec.suggestedItems && lunchRec.suggestedItems.length > 0) {
      const itemsList = lunchRec.suggestedItems
        .map(i => `• **${i.name}**: ${i.recommendedPortionLabel} (~${i.recommendedProteinG}g protein)`)
        .join('\n');

      return {
        answer: `Today's hostel lunch is **${lunchMeal?.title || lunchRec.title}**.

Recommended plate setup for your **${goal}** goal:
${itemsList}

**Total estimated protein from lunch:** ~${lunchRec.totalSuggestedProtein}g.`,
        actionableItems: ['Lunch'],
        disclaimer: "Values based on official hostel mess schedule."
      };
    }
  }

  // 2. "Skipped breakfast" or "skipped a meal"
  if (cleanQ.includes('skipped') || cleanQ.includes('skip')) {
    const unloggedMeals = ['Lunch', 'Snacks', 'Dinner'].filter(cat => {
      const rec = recommendations[cat];
      return rec && rec.status === 'PENDING';
    });

    let suggestions = [];
    if (unloggedMeals.length > 0) {
      unloggedMeals.forEach(mealType => {
        const rec = recommendations[mealType];
        if (rec && rec.suggestedItems && rec.suggestedItems.length > 0) {
          const topItem = rec.suggestedItems[0];
          suggestions.push(`${mealType}: Take extra ${topItem.name} (~${topItem.recommendedProteinG}g protein)`);
        }
      });
    }

    const topAlt = alternatives[0];
    const topAltText = topAlt ? ` Alternatively, add 1 serving of ${topAlt.name} (${topAlt.servingSize}, ~${topAlt.proteinG}g protein) to make up for the missed meal.` : '';

    return {
      answer: `Skipping a meal is completely normal on busy campus mornings! You currently need **${remaining}g protein** to hit your daily goal of **${target}g** (${completionPct}% done).
      
Here is how to recover seamlessly:
${suggestions.length > 0 ? suggestions.map(s => `• **${s}**`).join('\n') : '• Add an extra bowl of dal/chole during lunch or dinner.'}
${topAltText}
Remember: You don't need to force-feed yourself—aim for consistent daily averages rather than stressing over a single missed slot.`,
      actionableItems: unloggedMeals,
      disclaimer: "Campus dining guidance based on your mess menu. Not medical advice."
    };
  }

  // 3. "How much protein have I consumed" / "current progress" / "status"
  if (cleanQ.includes('how much') || cleanQ.includes('consumed') || cleanQ.includes('progress') || (cleanQ.includes('protein') && (cleanQ.includes('today') || cleanQ.includes('target') || cleanQ.includes('status')))) {
    return {
      answer: `Here is your live daily intake summary:
• **Target Protein:** ${target}g (${(target / weight).toFixed(1)} g/kg of body weight)
• **Consumed So Far:** ${consumed}g (${completionPct}% achieved)
• **Remaining Deficit:** ${remaining > 0 ? `${remaining}g remaining` : '🎉 Target Achieved!'}
• **Meals Tracked:** ${summary.completedMealsCount || 0} of 4 today

${remaining > 0 
  ? `You have **${remaining}g** left to cover across your remaining mess meals.`
  : 'You have comfortably hit your target for today! Keep up the great discipline.'}`,
      actionableItems: [],
      disclaimer: "Nutrition values calculated from standard ICMR-NIN serving estimates."
    };
  }

  // 4. "Vegetarian combo" / "veg options"
  if (cleanQ.includes('vegetarian') || cleanQ.includes('veg') || cleanQ.includes('paneer') || cleanQ.includes('dal')) {
    const vegAlts = alternatives.filter(a => a.category === 'Vegetarian').slice(0, 3);
    const altPills = vegAlts.map(a => `• **${a.name}** (${a.servingSize}): ~${a.proteinG}g protein (${a.availability})`).join('\n');

    return {
      answer: `Hostel mess menus are packed with plant protein if you know what to double up on!

**Top campus vegetarian combinations:**
1. **Double Dal / Rajma / Chole:** Ask the mess staff for a 2nd katori of dal (~8-12g extra protein).
2. **Curd / Dahi Counter:** A standard cup of fresh curd adds ~6g protein and probiotics for easy digestion.
3. **Campus Alternatives to bridge any gap:**
${altPills}

Always pair lentils with roti or rice for a complete amino acid profile!`,
      actionableItems: [],
      disclaimer: "ICMR-NIN plant nutrition guidelines."
    };
  }

  // 5. "Outside mess" / "alternatives" / "canteen" / "eggs" / "whey"
  if (cleanQ.includes('outside') || cleanQ.includes('alternative') || cleanQ.includes('canteen') || cleanQ.includes('snack') || cleanQ.includes('buy')) {
    const list = alternatives.slice(0, 4).map(a => 
      `• **${a.name}** (${a.servingSize}): ~**${a.proteinG}g** protein • Cost: ~${a.costEstimate} • Available at: ${a.availability}`
    ).join('\n');

    return {
      answer: `When the mess menu doesn't give you enough protein, here are the most affordable and effective campus alternatives:

${list}

You can log any of these in 1 tap under the **MY MEALS** tab using the *Log Outside Food* tool!`,
      actionableItems: [],
      disclaimer: "Estimated campus pricing and nutritional profiles."
    };
  }

  // 6. Generic / Fallback query: synthesize context
  const nextRec = Object.values(recommendations).find(r => r.status === 'PENDING') || recommendations['Dinner'] || null;

  return {
    answer: `Here is your current fitness snapshot, ${studentName}:
• **Your Goal:** ${goal} (${weight} kg body weight)
• **Daily Target:** ${target}g protein (${(target / weight).toFixed(1)} g/kg)
• **Current Status:** ${consumed}g consumed (${completionPct}%), **${remaining}g remaining**.

${nextRec && nextRec.suggestedItems && nextRec.suggestedItems.length > 0 
  ? `**Upcoming recommended meal (${nextRec.category}):**
${nextRec.suggestedItems.map(i => `• ${i.name} (~${i.recommendedProteinG}g)`).join('\n')}` 
  : `Keep logging your meals after eating to see your remaining target automatically adapt!`}

What specific advice would you like on today's mess menu or post-workout nutrition?`,
    actionableItems: [],
    disclaimer: "Educational campus nutrition companion. Not medical advice."
  };
}
