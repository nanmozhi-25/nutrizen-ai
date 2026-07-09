import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Camera, Flame, Droplet, Scale,
  UtensilsCrossed, Target, Trophy, Wind, TrendingUp, Zap, Sparkles, Weight,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProgressRing from "../components/ProgressRing";
import WeeklyChart from "../components/WeeklyChart";
import TrendBadge from "../components/TrendBadge";
import InsightsCard from "../components/InsightsCard";
import AnimatedNumber from "../components/AnimatedNumber";
import { SkeletonCard } from "../components/Skeleton";
import { todayKey, loadData, lastNDays } from "../utils/storage";
import { fetchGoals, fetchWater, fetchCalories, fetchWaterHistory, fetchCalorieHistory } from "../utils/api";
import { generateInsights } from "../utils/insights";

const features = [
  { to: "/recommendations", icon: Sparkles, title: "Recommendations", desc: "Personalized suggestions based on your activity", bg: "var(--accent-achievements-bg)", color: "var(--accent-achievements-icon)" },
  { to: "/food-scanner", icon: Camera, title: "Food Scanner", desc: "Scan food to get instant nutrition info", bg: "var(--accent-food-bg)", color: "var(--accent-food-icon)" },
  { to: "/calorie-tracker", icon: Flame, title: "Calorie Tracker", desc: "Log meals and track daily calories", bg: "var(--accent-calories-bg)", color: "var(--accent-calories-icon)" },
  { to: "/water-tracker", icon: Droplet, title: "Water Tracker", desc: "Track your daily water intake", bg: "var(--accent-water-bg)", color: "var(--accent-water-icon)" },
  { to: "/weight-tracker", icon: Weight, title: "Weight Tracker", desc: "Log your weight and see your trend", bg: "color-mix(in srgb, var(--accent-bmi-icon) 15%, transparent)", color: "var(--accent-bmi-icon)" },
  { to: "/bmi-calculator", icon: Scale, title: "BMI Calculator", desc: "Check your Body Mass Index", bg: "color-mix(in srgb, var(--accent-bmi-icon) 15%, transparent)", color: "var(--accent-bmi-icon)" },
  { to: "/meal-planner", icon: UtensilsCrossed, title: "Meal Planner", desc: "Plan balanced meals for the week", bg: "var(--accent-food-bg)", color: "var(--accent-food-icon)" },
  { to: "/goals", icon: Target, title: "Goals", desc: "Set and track your health goals", bg: "var(--accent-goals-bg)", color: "var(--accent-goals-icon)" },
  { to: "/achievements", icon: Trophy, title: "Achievements", desc: "See badges you've earned", bg: "var(--accent-achievements-bg)", color: "var(--accent-achievements-icon)" },
  { to: "/meditation", icon: Wind, title: "Meditation", desc: "Guided sessions for a calm mind", bg: "var(--accent-achievements-bg)", color: "var(--accent-achievements-icon)" },
  { to: "/breathing", icon: Wind, title: "Breathing", desc: "Breathing exercises to de-stress", bg: "var(--accent-water-bg)", color: "var(--accent-water-icon)" },
];

// Consecutive days (from today backwards) with any logged activity
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

function buildMeditationTrend() {
  return lastNDays(7).map(({ key, label }) => ({
    label,
    value: loadData(`nz_meditation_${key}`, 0),
  }));
}

function buildWeightTrend() {
  const log = loadData("nz_weight_log", []);
  return log.slice(-7).map((e) => ({
    label: new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" }),
    value: e.value,
  }));
}

function buildBmiTrend() {
  const log = loadData("nz_bmi_history", []);
  return log.slice(-7).map((e) => ({
    label: new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" }),
    value: e.value,
  }));
}

function buildMonthlyGoalCompletion() {
  const log = loadData("nz_goal_completion_log", []); // array of "YYYY-MM-DD"
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    const count = log.filter((dateStr) => dateStr.startsWith(key)).length;
    months.push({ label, value: count });
  }
  return months;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calorieTrend, setCalorieTrend] = useState([]);
  const [waterTrend, setWaterTrend] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [tips, setTips] = useState([]);
  const [meditationTrend, setMeditationTrend] = useState([]);
  const [weightTrend, setWeightTrend] = useState([]);
  const [bmiTrend, setBmiTrend] = useState([]);
  const [goalCompletionTrend, setGoalCompletionTrend] = useState([]);

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
        const goalsDone = goals.filter((g) => g.done).length;
        const goalsTotal = goals.length;

        const yesterdayKey = (() => {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d.toISOString().slice(0, 10);
        })();
        const yesterdayWaterLog = waterHist.find((h) => h.date === yesterdayKey);
        const yesterdayCalorieLog = calorieHist.find((h) => h.date === yesterdayKey);
        const yesterdayWater = yesterdayWaterLog ? yesterdayWaterLog.glasses : 0;
        const yesterdayCalories = yesterdayCalorieLog
          ? yesterdayCalorieLog.entries.reduce((s, e) => s + e.calories, 0)
          : 0;

        const last7Water = waterHist.slice(0, 7);
        const last7Calories = calorieHist.slice(0, 7);
        const weeklyWaterAvg = last7Water.length
          ? last7Water.reduce((s, h) => s + h.glasses, 0) / last7Water.length
          : 0;
        const weeklyCalorieAvg = last7Calories.length
          ? last7Calories.reduce((s, h) => s + h.entries.reduce((s2, e) => s2 + e.calories, 0), 0) / last7Calories.length
          : 0;

        const computedStreak = computeStreak(waterHist, calorieHist);

        setStats({
          calories, calorieGoal, water: water.glasses || 0, waterGoal,
          goalsDone, goalsTotal, yesterdayWater, yesterdayCalories,
        });
        setStreak(computedStreak);

        setTips(generateInsights({
          calories, calorieGoal, water: water.glasses || 0, waterGoal,
          goalsDone, goalsTotal, streak: computedStreak, weeklyWaterAvg, weeklyCalorieAvg,
        }));

        const wMap = Object.fromEntries(waterHist.map((h) => [h.date, h.glasses]));
        const cMap = Object.fromEntries(
          calorieHist.map((h) => [h.date, h.entries.reduce((s, e) => s + e.calories, 0)])
        );
        setWaterTrend(lastNDays(7).map(({ key, label }) => ({ label, value: wMap[key] || 0 })));
        setCalorieTrend(lastNDays(7).map(({ key, label }) => ({ label, value: cMap[key] || 0 })));
      })
      .catch(() => {
        setStats({ calories: 0, calorieGoal: 2000, water: 0, waterGoal: 8, goalsDone: 0, goalsTotal: 0 });
        setTips(generateInsights({ calories: 0, calorieGoal: 2000, water: 0, waterGoal: 8, goalsDone: 0, goalsTotal: 0, streak: 0 }));
      });

    setTodaysMeals(loadData(`nz_diary_${today}`, []));
    setMeditationTrend(buildMeditationTrend());
    setWeightTrend(buildWeightTrend());
    setBmiTrend(buildBmiTrend());
    setGoalCompletionTrend(buildMonthlyGoalCompletion());
  }, []);

  const calorieGoalPct = stats ? Math.min(100, Math.round((stats.calories / stats.calorieGoal) * 100)) : 0;
  const goalsPct = stats && stats.goalsTotal > 0 ? Math.round((stats.goalsDone / stats.goalsTotal) * 100) : 0;

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Welcome back" subtitle="Here's your NutriZen AI overview for today." />

      {!stats ? (
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ background: "var(--accent-calories-bg)", border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="stat-label" style={{ color: "var(--accent-calories-icon)" }}>Calories Today</div>
              <TrendBadge current={stats.calories} previous={stats.yesterdayCalories} />
            </div>
            <div className="stat-value" style={{ color: "var(--accent-calories-icon)" }}>
              <AnimatedNumber value={stats.calories} suffix=" kcal" />
            </div>
            <div className="progress-track" style={{ marginTop: 8, height: 6 }}>
              <div className="progress-fill" style={{ width: `${calorieGoalPct}%`, background: "var(--accent-calories-icon)" }} />
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--accent-water-bg)", border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="stat-label" style={{ color: "var(--accent-water-icon)" }}>Water Intake</div>
              <TrendBadge current={stats.water} previous={stats.yesterdayWater} />
            </div>
            <div className="stat-value" style={{ color: "var(--accent-water-icon)" }}>
              <AnimatedNumber value={stats.water} suffix=" glasses" />
            </div>
            <div className="progress-track" style={{ marginTop: 8, height: 6 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, Math.round((stats.water / stats.waterGoal) * 100))}%`, background: "var(--accent-water-icon)" }} />
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--accent-goals-bg)", border: "none" }}>
            <div className="stat-label" style={{ color: "var(--accent-goals-icon)" }}>Goals Progress</div>
            <div className="stat-value" style={{ color: "var(--accent-goals-icon)" }}>
              <AnimatedNumber value={stats.goalsDone} />/{stats.goalsTotal}
            </div>
            <div className="progress-track" style={{ marginTop: 8, height: 6 }}>
              <div className="progress-fill" style={{ width: `${goalsPct}%`, background: "var(--accent-goals-icon)" }} />
            </div>
          </div>
          <div className="stat-card" style={{ background: "color-mix(in srgb, var(--color-warning) 15%, transparent)", border: "none" }}>
            <div className="stat-label" style={{ color: "var(--color-warning)", display: "flex", alignItems: "center", gap: 4 }}>
              <Zap size={12} /> Activity Streak
            </div>
            <div className="stat-value" style={{ color: "var(--color-warning)" }}>
              <AnimatedNumber value={streak} suffix={streak === 1 ? " day" : " days"} />
            </div>
          </div>
        </div>
      )}

      {tips.length > 0 && <InsightsCard tips={tips} />}

      {stats && (
        <div className="grid-2" style={{ marginBottom: 20, marginTop: 20 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ justifyContent: "center" }}>Calorie Goal</h3>
            <ProgressRing percent={calorieGoalPct} color="var(--accent-calories-icon)" label={`${stats.calories}/${stats.calorieGoal} kcal`} />
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <h3 style={{ justifyContent: "center" }}>Goal Completion</h3>
            <ProgressRing percent={goalsPct} color="var(--accent-goals-icon)" label={`${stats.goalsDone}/${stats.goalsTotal} goals`} />
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-calories-icon)" /> Weekly Calories
          </h3>
          <WeeklyChart data={calorieTrend} color="var(--accent-calories-icon)" unit=" kcal" />
        </div>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-water-icon)" /> Weekly Water
          </h3>
          <WeeklyChart data={waterTrend} color="var(--accent-water-icon)" unit=" glasses" />
        </div>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-achievements-icon)" /> Meditation Minutes
          </h3>
          {meditationTrend.every((d) => d.value === 0) ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>No sessions logged this week yet.</p>
          ) : (
            <WeeklyChart data={meditationTrend} color="var(--accent-achievements-icon)" unit=" min" />
          )}
        </div>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-bmi-icon)" /> Weight Trend
          </h3>
          {weightTrend.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Log your weight to see a trend here.</p>
          ) : (
            <WeeklyChart data={weightTrend} color="var(--accent-bmi-icon)" unit=" kg" />
          )}
        </div>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-bmi-icon)" /> BMI Trend
          </h3>
          {bmiTrend.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Calculate your BMI a few times to see a trend here.</p>
          ) : (
            <WeeklyChart data={bmiTrend} color="var(--accent-bmi-icon)" unit="" />
          )}
        </div>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={18} color="var(--accent-goals-icon)" /> Monthly Goal Completion
          </h3>
          <WeeklyChart data={goalCompletionTrend} color="var(--accent-goals-icon)" unit=" goals" />
        </div>
      </div>

      <div className="card">
        <h3>Today's Meals</h3>
        {todaysMeals.length === 0 ? (
          <div className="empty-state">
            <Camera size={32} className="empty-icon" style={{ display: "block", margin: "0 auto 8px" }} />
            <p>No meals logged today. Scan your breakfast to begin.</p>
          </div>
        ) : (
          todaysMeals.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < todaysMeals.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <span>{m.food}</span>
              <span style={{ color: "var(--color-text-muted)" }}>{m.calories} kcal · {m.time}</span>
            </div>
          ))
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Link to={f.to} key={f.to} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="card">
                <div className="feature-icon" style={{ background: f.bg, color: f.color }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <h3 style={{ marginTop: 0 }}>{f.title}</h3>
                <p style={{ color: "var(--color-text-muted)", margin: 0 }}>{f.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
