// Rule-based Recommendation Engine
// -----------------------------------
// Analyzes the user's own logged data (no external AI API, no cost, works
// fully offline) and produces categorized, scored recommendations —
// similar in spirit to a heuristic fallback engine used in production
// analytics products when a live model isn't available.

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreFromGap(actual, target, tolerance = 0.15) {
  // How far actual is from target, converted to a 0-100 "match score".
  if (!target) return 50;
  const ratio = actual / target;
  const gap = Math.abs(1 - ratio);
  return clamp(Math.round(100 - gap * 100 * (1 / tolerance) * tolerance), 0, 100);
}

export function buildRecommendations({
  calories,
  calorieGoal,
  water,
  waterGoal,
  goals,
  weeklyWaterAvg,
  weeklyCalorieAvg,
  bmi,
  mealPlanDaysFilled,
  streak,
}) {
  const recs = [];

  // ---------------- NUTRITION ----------------
  if (calorieGoal > 0) {
    const remaining = calorieGoal - calories;
    const pctUsed = Math.round((calories / calorieGoal) * 100);
    const score = scoreFromGap(calories, calorieGoal, 0.1);

    if (remaining > 300) {
      recs.push({
        category: "Nutrition",
        priority: pctUsed < 50 ? "high" : "medium",
        score,
        title: "Room left in today's calorie budget",
        detail: `You have about ${remaining} kcal remaining today (${pctUsed}% used). A balanced snack with protein and fiber would fit well.`,
      });
    } else if (remaining < -200) {
      recs.push({
        category: "Nutrition",
        priority: "high",
        score,
        title: "Over today's calorie goal",
        detail: `You're about ${Math.abs(remaining)} kcal over goal. A lighter next meal or a short walk can help balance the day.`,
      });
    } else {
      recs.push({
        category: "Nutrition",
        priority: "low",
        score,
        title: "On track with calories",
        detail: "Your intake today is well aligned with your goal. Keep the current meal pattern going.",
      });
    }
  }

  if (weeklyCalorieAvg !== undefined && calorieGoal > 0) {
    const weeklyScore = scoreFromGap(weeklyCalorieAvg, calorieGoal, 0.12);
    if (weeklyCalorieAvg > calorieGoal * 1.1) {
      recs.push({
        category: "Nutrition",
        priority: "medium",
        score: weeklyScore,
        title: "Weekly average running high",
        detail: `Your 7-day average (${Math.round(weeklyCalorieAvg)} kcal) is above your goal. Try reviewing portion sizes on your highest-calorie day.`,
      });
    }
  }

  // ---------------- HYDRATION ----------------
  if (waterGoal > 0) {
    const waterScore = scoreFromGap(water, waterGoal, 0.15);
    const hour = new Date().getHours();
    const expectedByNow = Math.round((clamp(hour, 6, 22) - 6) / 16 * waterGoal);

    if (water < expectedByNow - 1) {
      recs.push({
        category: "Hydration",
        priority: "high",
        score: waterScore,
        title: "Behind on hydration for this time of day",
        detail: `Based on the time, you'd typically be at ~${expectedByNow} glasses by now — you're at ${water}. Try a glass with your next meal.`,
      });
    } else if (water >= waterGoal) {
      recs.push({
        category: "Hydration",
        priority: "low",
        score: 100,
        title: "Hydration goal met",
        detail: "Nice work — you've hit your water goal for today.",
      });
    } else {
      recs.push({
        category: "Hydration",
        priority: "medium",
        score: waterScore,
        title: "On pace for your hydration goal",
        detail: `You're at ${water}/${waterGoal} glasses — on track for the day.`,
      });
    }
  }

  if (weeklyWaterAvg !== undefined && waterGoal > 0 && weeklyWaterAvg < waterGoal * 0.75) {
    recs.push({
      category: "Hydration",
      priority: "medium",
      score: scoreFromGap(weeklyWaterAvg, waterGoal, 0.15),
      title: "Weekly hydration trending low",
      detail: `Your 7-day average is ${weeklyWaterAvg.toFixed(1)} glasses vs a goal of ${waterGoal}. Setting a recurring reminder could help close the gap.`,
    });
  }

  // ---------------- FITNESS / GOALS ----------------
  const goalsTotal = goals?.length || 0;
  const goalsDone = goals?.filter((g) => g.done).length || 0;

  if (goalsTotal === 0) {
    recs.push({
      category: "Goals",
      priority: "medium",
      score: 30,
      title: "No active goals set",
      detail: "Users with at least one active goal tend to stay more consistent. Try adding a simple one today.",
    });
  } else {
    const goalScore = Math.round((goalsDone / goalsTotal) * 100);
    if (goalScore < 40) {
      recs.push({
        category: "Goals",
        priority: "medium",
        score: goalScore,
        title: "Several goals still open",
        detail: `${goalsDone}/${goalsTotal} completed. Picking one small, achievable goal to finish first often builds momentum for the rest.`,
      });
    } else if (goalScore === 100) {
      recs.push({
        category: "Goals",
        priority: "low",
        score: 100,
        title: "All current goals completed",
        detail: "Great consistency. Consider setting a slightly more ambitious goal for next week.",
      });
    }
  }

  if (streak >= 5) {
    recs.push({
      category: "Goals",
      priority: "low",
      score: clamp(60 + streak, 0, 100),
      title: `${streak}-day activity streak`,
      detail: "Long streaks are one of the strongest predictors of habit formation — keep the chain going.",
    });
  }

  // ---------------- MINDFULNESS ----------------
  if (mealPlanDaysFilled !== undefined && mealPlanDaysFilled < 3) {
    recs.push({
      category: "Mindfulness",
      priority: "low",
      score: Math.round((mealPlanDaysFilled / 7) * 100),
      title: "Meal plan mostly empty",
      detail: "Planning even 2-3 days ahead reduces decision fatigue and impulsive food choices.",
    });
  } else {
    recs.push({
      category: "Mindfulness",
      priority: "low",
      score: 70,
      title: "Take a mindful break today",
      detail: "A 5-minute guided breathing session can reset focus — try the Breathing page between tasks.",
    });
  }

  // ---------------- BMI-BASED (if available) ----------------
  if (bmi) {
    if (bmi < 18.5) {
      recs.push({
        category: "Nutrition",
        priority: "medium",
        score: 55,
        title: "BMI suggests room to build",
        detail: "Your last recorded BMI is in the underweight range. Nutrient-dense meals with healthy fats can help.",
      });
    } else if (bmi >= 25 && bmi < 30) {
      recs.push({
        category: "Fitness",
        priority: "medium",
        score: 55,
        title: "BMI suggests light activity could help",
        detail: "Your last recorded BMI is in the overweight range. A daily 20-30 minute walk is a low-friction starting point.",
      });
    } else if (bmi >= 30) {
      recs.push({
        category: "Fitness",
        priority: "high",
        score: 40,
        title: "Consider a structured activity plan",
        detail: "Your last recorded BMI is in the obese range. A gradual, consistent activity plan — and a check-in with a healthcare provider — is worth considering.",
      });
    }
  }

  // Sort: high priority first, then by score ascending (lowest score = most actionable)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.score - b.score;
  });
}
