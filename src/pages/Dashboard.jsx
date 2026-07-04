import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Camera, Flame, Droplet, Scale,
  UtensilsCrossed, Target, Trophy, Wind, TrendingUp,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ProgressRing from "../components/ProgressRing";
import WeeklyChart from "../components/WeeklyChart";
import { SkeletonCard } from "../components/Skeleton";
import { todayKey, loadData, lastNDays } from "../utils/storage";
import { fetchGoals, fetchWater, fetchCalories, fetchWaterHistory, fetchCalorieHistory } from "../utils/api";

const features = [
  { to: "/food-scanner", icon: Camera, title: "Food Scanner", desc: "Scan food to get instant nutrition info", bg: "var(--accent-food-bg)", color: "var(--accent-food-icon)" },
  { to: "/calorie-tracker", icon: Flame, title: "Calorie Tracker", desc: "Log meals and track daily calories", bg: "var(--accent-calories-bg)", color: "var(--accent-calories-icon)" },
  { to: "/water-tracker", icon: Droplet, title: "Water Tracker", desc: "Track your daily water intake", bg: "var(--accent-water-bg)", color: "var(--accent-water-icon)" },
  { to: "/bmi-calculator", icon: Scale, title: "BMI Calculator", desc: "Check your Body Mass Index", bg: "color-mix(in srgb, var(--accent-bmi-icon) 15%, transparent)", color: "var(--accent-bmi-icon)" },
  { to: "/meal-planner", icon: UtensilsCrossed, title: "Meal Planner", desc: "Plan balanced meals for the week", bg: "var(--accent-food-bg)", color: "var(--accent-food-icon)" },
  { to: "/goals", icon: Target, title: "Goals", desc: "Set and track your health goals", bg: "var(--accent-goals-bg)", color: "var(--accent-goals-icon)" },
  { to: "/achievements", icon: Trophy, title: "Achievements", desc: "See badges you've earned", bg: "var(--accent-achievements-bg)", color: "var(--accent-achievements-icon)" },
  { to: "/meditation", icon: Wind, title: "Meditation", desc: "Guided sessions for a calm mind", bg: "var(--accent-achievements-bg)", color: "var(--accent-achievements-icon)" },
  { to: "/breathing", icon: Wind, title: "Breathing", desc: "Breathing exercises to de-stress", bg: "var(--accent-water-bg)", color: "var(--accent-water-icon)" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [calorieTrend, setCalorieTrend] = useState([]);
  const [waterTrend, setWaterTrend] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);

  useEffect(() => {
    const today = todayKey();

    Promise.all([
      fetchGoals(),
      fetchWater(today),
      fetchCalories(today),
      fetchWaterHistory(7),
      fetchCalorieHistory(7),
    ])
      .then(([goals, water, calorieLog, waterHist, calorieHist]) => {
        const calories = (calorieLog.entries || []).reduce((s, e) => s + e.calories, 0);
        const calorieGoal = calorieLog.goal || 2000;
        const waterGoal = water.goal || 8;

        setStats({
          calories,
          calorieGoal,
          water: water.glasses || 0,
          waterGoal,
          goalsDone: goals.filter((g) => g.done).length,
          goalsTotal: goals.length,
        });

        const wMap = Object.fromEntries(waterHist.map((h) => [h.date, h.glasses]));
        const cMap = Object.fromEntries(
          calorieHist.map((h) => [h.date, h.entries.reduce((s, e) => s + e.calories, 0)])
        );
        setWaterTrend(
          lastNDays(7).map(({ key, label }) => ({ label, value: wMap[key] || 0 }))
        );
        setCalorieTrend(
          lastNDays(7).map(({ key, label }) => ({ label, value: cMap[key] || 0 }))
        );
      })
      .catch(() => {
        setStats({ calories: 0, calorieGoal: 2000, water: 0, waterGoal: 8, goalsDone: 0, goalsTotal: 0 });
      });

    setTodaysMeals(loadData(`nz_diary_${today}`, []));
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
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="stat-card" style={{ background: "var(--accent-calories-bg)", border: "none" }}>
            <div className="stat-label" style={{ color: "var(--accent-calories-icon)" }}>Calories Today</div>
            <div className="stat-value" style={{ color: "var(--accent-calories-icon)" }}>{stats.calories} kcal</div>
          </div>
          <div className="stat-card" style={{ background: "var(--accent-water-bg)", border: "none" }}>
            <div className="stat-label" style={{ color: "var(--accent-water-icon)" }}>Water Intake</div>
            <div className="stat-value" style={{ color: "var(--accent-water-icon)" }}>{stats.water} glasses</div>
          </div>
          <div className="stat-card" style={{ background: "var(--accent-goals-bg)", border: "none" }}>
            <div className="stat-label" style={{ color: "var(--accent-goals-icon)" }}>Goals Progress</div>
            <div className="stat-value" style={{ color: "var(--accent-goals-icon)" }}>{stats.goalsDone}/{stats.goalsTotal}</div>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid-2" style={{ marginBottom: 20 }}>
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
      </div>

      <div className="card">
        <h3>Today's Meals</h3>
        {todaysMeals.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            No meals logged yet — try the Food Scanner.
          </p>
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
