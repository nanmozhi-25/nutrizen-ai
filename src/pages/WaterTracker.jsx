import { useState, useEffect } from "react";
import { Droplet, Minus, Plus, TrendingUp, Lightbulb } from "lucide-react";
import PageHeader from "../components/PageHeader";
import WeeklyChart from "../components/WeeklyChart";
import { SkeletonCard } from "../components/Skeleton";
import { todayKey } from "../utils/storage";
import { fetchWater, updateWater, fetchWaterHistory } from "../utils/api";
import { playSuccess, playAchievement, playClick } from "../utils/sound";
import { sendNotification } from "../utils/notifications";
import { useToast } from "../components/ToastContext";

const GLASS_ML = 250;

const TIPS = [
  "Drink a glass of water right after waking up.",
  "Keep a water bottle at your desk as a visual reminder.",
  "Herbal tea and fruit-infused water count toward your goal.",
  "Drink a glass before every meal to help with portion control.",
];

export default function WaterTracker() {
  const today = todayKey();
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showToast = useToast();
  const tip = TIPS[new Date().getDate() % TIPS.length];

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      const [todayLog, history] = await Promise.all([
        fetchWater(today),
        fetchWaterHistory(7),
      ]);
      setGlasses(todayLog.glasses || 0);
      setGoal(todayLog.goal || 8);

      const historyMap = Object.fromEntries(history.map((h) => [h.date, h.glasses]));
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({ label: d.toLocaleDateString("en-IN", { weekday: "short" }), value: historyMap[key] || 0 });
      }
      setWeeklyData(days);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function change(delta) {
    const updated = Math.max(0, glasses + delta);
    setGlasses(updated);
    try {
      await updateWater(today, { glasses: updated });
      if (delta > 0) {
        if (updated === goal) {
          playAchievement();
          sendNotification("Goal Reached", "You've hit your water goal for today!");
          showToast("Hydration goal reached!", "success");
        } else {
          playSuccess();
        }
      } else {
        playClick();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateGoal(e) {
    const val = Number(e.target.value);
    setGoal(val);
    try {
      await updateWater(today, { goal: val });
    } catch (err) {
      setError(err.message);
    }
  }

  const percent = Math.min(100, Math.round((glasses / goal) * 100));

  return (
    <div>
      <PageHeader icon={Droplet} title="Water Tracker" subtitle="Stay hydrated throughout the day." />

      {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && (
        <>
          <div className="card" style={{ textAlign: "center" }}>
            <h3>{glasses} / {goal} glasses</h3>
            {glasses === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>
                Drink your first glass of water to start today's hydration.
              </p>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>
                ≈ {glasses * GLASS_ML} ml today
              </p>
            )}

            <div className="progress-track" style={{ margin: "16px 0" }}>
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => change(-1)}>
                <Minus size={16} /> Remove
              </button>
              <button className="btn btn-primary" onClick={() => change(1)}>
                <Plus size={16} /> Add Glass
              </button>
            </div>

            <label style={{ display: "block", marginTop: 20, fontSize: "0.85rem" }}>
              Daily Goal (glasses)
              <input
                type="number"
                value={goal}
                onChange={updateGoal}
                style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: "1px solid var(--color-border)", width: 70 }}
              />
            </label>
          </div>

          <div className="suggestion-box">
            <div className="suggestion-title">
              <Lightbulb size={15} /> Hydration Tip
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{tip}</p>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} /> Last 7 Days
            </h3>
            <WeeklyChart data={weeklyData} color="var(--accent-water-icon)" unit=" glasses" />
          </div>
        </>
      )}
    </div>
  );
}
