import { useEffect, useState } from "react";
import { Sparkles, Apple, Droplet, Target, Wind, Dumbbell, Info } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { SkeletonCard } from "../components/Skeleton";
import { todayKey, loadData } from "../utils/storage";
import { fetchGoals, fetchWater, fetchCalories, fetchWaterHistory, fetchCalorieHistory } from "../utils/api";
import { buildRecommendations } from "../utils/recommendationEngine";

const CATEGORY_ICON = {
  Nutrition: Apple,
  Hydration: Droplet,
  Goals: Target,
  Mindfulness: Wind,
  Fitness: Dumbbell,
};

const CATEGORY_COLOR = {
  Nutrition: "var(--accent-calories-icon)",
  Hydration: "var(--accent-water-icon)",
  Goals: "var(--accent-goals-icon)",
  Mindfulness: "var(--accent-achievements-icon)",
  Fitness: "var(--accent-bmi-icon)",
};

const PRIORITY_LABEL = { high: "High priority", medium: "Medium priority", low: "Low priority" };
const PRIORITY_COLOR = { high: "var(--color-danger)", medium: "var(--color-warning)", low: "var(--color-success)" };

function computeStreak(waterHist, calorieHist) {
  const activeDays = new Set();
  waterHist.forEach((h) => { if (h.glasses > 0) activeDays.add(h.date); });
  calorieHist.forEach((h) => { if ((h.entries || []).length > 0) activeDays.add(h.date); });
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (activeDays.has(key)) streak++;
    else break;
  }
  return streak;
}

export default function Recommendations() {
  const [recs, setRecs] = useState(null);

  useEffect(() => {
    const today = todayKey();

    Promise.all([
      fetchGoals(),
      fetchWater(today),
      fetchCalories(today),
      fetchWaterHistory(30),
      fetchCalorieHistory(30),
    ])
      .then(([goals, water, calorieLog, waterHist, calorieHist]) => {
        const calories = (calorieLog.entries || []).reduce((s, e) => s + e.calories, 0);
        const calorieGoal = calorieLog.goal || 2000;
        const waterGoal = water.goal || 8;

        const last7Water = waterHist.slice(0, 7);
        const last7Calories = calorieHist.slice(0, 7);
        const weeklyWaterAvg = last7Water.length
          ? last7Water.reduce((s, h) => s + h.glasses, 0) / last7Water.length
          : undefined;
        const weeklyCalorieAvg = last7Calories.length
          ? last7Calories.reduce((s, h) => s + h.entries.reduce((s2, e) => s2 + e.calories, 0), 0) / last7Calories.length
          : undefined;

        const lastBmi = loadData("nz_last_bmi", null);
        const mealPlan = loadData("nz_meal_plan", {});
        const mealPlanDaysFilled = Object.keys(mealPlan).filter(
          (day) => mealPlan[day] && Object.values(mealPlan[day]).some((v) => v && v.trim())
        ).length;

        const streak = computeStreak(waterHist, calorieHist);

        const result = buildRecommendations({
          calories,
          calorieGoal,
          water: water.glasses || 0,
          waterGoal,
          goals,
          weeklyWaterAvg,
          weeklyCalorieAvg,
          bmi: lastBmi ? lastBmi.value : null,
          mealPlanDaysFilled,
          streak,
        });

        setRecs(result);
      })
      .catch(() => setRecs([]));
  }, []);

  return (
    <div>
      <PageHeader
        icon={Sparkles}
        title="Recommendations"
        subtitle="Personalized suggestions generated from your own logged activity."
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
          fontSize: "0.78rem",
          color: "var(--color-text-muted)",
        }}
      >
        <Info size={14} />
        Rule-based recommendation engine — analyzes your data locally, no external AI service or cost involved.
      </div>

      {recs === null && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {recs && recs.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <Sparkles size={32} className="empty-icon" style={{ display: "block", margin: "0 auto 8px" }} />
            <p>Log some meals, water, or goals to unlock personalized recommendations.</p>
          </div>
        </div>
      )}

      {recs && recs.map((rec, i) => {
        const Icon = CATEGORY_ICON[rec.category] || Sparkles;
        const catColor = CATEGORY_COLOR[rec.category] || "var(--color-primary)";
        return (
          <div key={i} className="card">
            <div style={{ display: "flex", gap: 14 }}>
              <div
                className="feature-icon"
                style={{ background: `color-mix(in srgb, ${catColor} 15%, transparent)`, color: catColor, flexShrink: 0, marginBottom: 0 }}
              >
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ margin: 0 }}>{rec.title}</h3>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: PRIORITY_COLOR[rec.priority],
                      background: `color-mix(in srgb, ${PRIORITY_COLOR[rec.priority]} 12%, transparent)`,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {PRIORITY_LABEL[rec.priority]}
                  </span>
                </div>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: "6px 0 12px" }}>
                  {rec.detail}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", minWidth: 70 }}>
                    Match score
                  </span>
                  <div className="progress-track" style={{ flex: 1, height: 8 }}>
                    <div className="progress-fill" style={{ width: `${rec.score}%`, background: catColor }} />
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: catColor }}>{rec.score}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
