import { useState, useEffect } from "react";
import { Flame, TrendingUp } from "lucide-react";
import PageHeader from "../components/PageHeader";
import WeeklyChart from "../components/WeeklyChart";
import { SkeletonCard } from "../components/Skeleton";
import { todayKey } from "../utils/storage";
import { fetchCalories, addCalorieEntry, updateCalorieGoal, fetchCalorieHistory } from "../utils/api";
import { playSuccess } from "../utils/sound";
import { useToast } from "../components/ToastContext";

const QUICK_ADD = [
  { food: "Banana", calories: 105 },
  { food: "Boiled Egg", calories: 78 },
  { food: "Cup of Rice", calories: 205 },
  { food: "Chapati", calories: 120 },
  { food: "Glass of Milk", calories: 150 },
];

export default function CalorieTracker() {
  const today = todayKey();
  const [logs, setLogs] = useState([]);
  const [goal, setGoal] = useState(2000);
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showToast = useToast();

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    try {
      const [todayLog, history] = await Promise.all([
        fetchCalories(today),
        fetchCalorieHistory(7),
      ]);
      setLogs(todayLog.entries || []);
      setGoal(todayLog.goal || 2000);

      const historyMap = Object.fromEntries(
        history.map((h) => [h.date, h.entries.reduce((s, e) => s + e.calories, 0)])
      );
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

  const total = logs.reduce((s, l) => s + Number(l.calories), 0);
  const percent = Math.min(100, Math.round((total / goal) * 100));

  async function addEntry(e) {
    e.preventDefault();
    if (!name || !cal) return;
    try {
      await addCalorieEntry(today, name, Number(cal));
      setLogs((prev) => [...prev, { food: name, calories: Number(cal) }]);
      setName("");
      setCal("");
      playSuccess();
      showToast(`${name} logged`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  async function quickAdd(item) {
    try {
      await addCalorieEntry(today, item.food, item.calories);
      setLogs((prev) => [...prev, item]);
      playSuccess();
      showToast(`${item.food} added`, "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  async function updateGoal(e) {
    const val = Number(e.target.value);
    setGoal(val);
    try {
      await updateCalorieGoal(today, val);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader icon={Flame} title="Calorie Tracker" subtitle="Log your meals and stay on top of your daily goal." />

      {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {!loading && (
        <>
          <div className="card">
            <h3>Today's Progress</h3>
            {total === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>
                No meals logged today. Scan your breakfast to begin.
              </p>
            ) : (
              <p>
                {total} / {goal} kcal
              </p>
            )}
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <label style={{ display: "block", marginTop: 14, fontSize: "0.85rem" }}>
              Daily Goal (kcal)
              <input
                type="number"
                value={goal}
                onChange={updateGoal}
                style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: "1px solid var(--color-border)" }}
              />
            </label>
          </div>

          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} /> Last 7 Days
            </h3>
            <WeeklyChart data={weeklyData} color="var(--accent-calories-icon)" unit=" kcal" />
          </div>

          <div className="card">
            <h3>Log Food</h3>
            <form onSubmit={addEntry} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                placeholder="Food name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
              <input
                placeholder="Calories"
                type="number"
                value={cal}
                onChange={(e) => setCal(e.target.value)}
                style={{ width: 120, padding: 8, borderRadius: 8, border: "1px solid var(--color-border)" }}
              />
              <button className="btn btn-primary" type="submit">Add</button>
            </form>

            <div className="suggestion-chips">
              {QUICK_ADD.map((item) => (
                <button key={item.food} className="suggestion-chip" onClick={() => quickAdd(item)}>
                  + {item.food} ({item.calories} kcal)
                </button>
              ))}
            </div>

            {logs.map((l, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span>{l.food}</span>
                <span>{l.calories} kcal</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
