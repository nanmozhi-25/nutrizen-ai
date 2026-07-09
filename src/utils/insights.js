// Generates personalized, rule-based suggestions from the user's recent
// activity. No AI API needed — pure logic over their own logged data,
// which is honest, fast, and works completely offline.

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function generateInsights({
  calories,
  calorieGoal,
  water,
  waterGoal,
  goalsDone,
  goalsTotal,
  streak,
  weeklyWaterAvg,
  weeklyCalorieAvg,
  hour = new Date().getHours(),
}) {
  const tips = [];

  // ---- Time-of-day aware nudges ----
  if (hour < 11 && water === 0) {
    tips.push({ type: "info", text: "Start your day with a glass of water — you haven't logged any yet this morning." });
  }
  if (hour >= 20 && calories === 0) {
    tips.push({ type: "warning", text: "No meals logged today. Log dinner in Food Scanner so tomorrow's trend stays accurate." });
  }

  // ---- Water routine ----
  if (waterGoal > 0) {
    const waterPct = pct(water, waterGoal);
    if (hour >= 14 && waterPct < 50) {
      tips.push({ type: "warning", text: `You're at ${waterPct}% of your water goal by mid-afternoon — try to catch up with a couple of glasses.` });
    } else if (waterPct >= 100) {
      tips.push({ type: "success", text: "Hydration goal reached for today. Well done!" });
    }
  }

  // ---- Calorie routine ----
  if (calorieGoal > 0 && calories > 0) {
    const caloriePct = pct(calories, calorieGoal);
    if (caloriePct > 110) {
      tips.push({ type: "warning", text: `You're ${caloriePct - 100}% over your calorie goal today — consider a lighter dinner or an evening walk.` });
    } else if (caloriePct < 60 && hour >= 18) {
      tips.push({ type: "info", text: "Calorie intake looks low for this time of day — make sure you're eating enough." });
    }
  }

  // ---- Streak-based encouragement ----
  if (streak >= 7) {
    tips.push({ type: "success", text: `${streak}-day logging streak! Consistency like this is what builds lasting habits.` });
  } else if (streak >= 3) {
    tips.push({ type: "success", text: `${streak} days in a row logging your activity — keep it going.` });
  } else if (streak === 0) {
    tips.push({ type: "info", text: "Log something today (water, a meal, or a goal) to start a new streak." });
  }

  // ---- Weekly pattern comparison ----
  if (weeklyWaterAvg !== undefined && waterGoal > 0 && weeklyWaterAvg < waterGoal * 0.7) {
    tips.push({ type: "info", text: "Your average water intake this week is below goal — try setting reminders every 2 hours." });
  }
  if (weeklyCalorieAvg !== undefined && calorieGoal > 0 && weeklyCalorieAvg > calorieGoal * 1.15) {
    tips.push({ type: "warning", text: "Your weekly average calories are running high — reviewing portion sizes could help." });
  }

  // ---- Goals nudge ----
  if (goalsTotal > 0) {
    const goalsPctVal = pct(goalsDone, goalsTotal);
    if (goalsPctVal === 100) {
      tips.push({ type: "success", text: "All goals completed! Add a new one to keep progressing." });
    } else if (goalsPctVal < 30 && goalsTotal >= 3) {
      tips.push({ type: "info", text: "Most of your goals are still open — pick one small one to finish today." });
    }
  } else {
    tips.push({ type: "info", text: "You haven't set any goals yet — even one small goal helps build momentum." });
  }

  // Always return something useful, even with no data yet
  if (tips.length === 0) {
    tips.push({ type: "info", text: "Keep logging your meals, water, and goals daily for more personalized tips here." });
  }

  return tips.slice(0, 4); // keep the dashboard focused — max 4 tips at a time
}
