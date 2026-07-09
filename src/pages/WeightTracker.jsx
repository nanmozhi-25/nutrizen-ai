import { useState, useEffect } from "react";
import { Weight, TrendingUp } from "lucide-react";
import PageHeader from "../components/PageHeader";
import WeeklyChart from "../components/WeeklyChart";
import { loadData, saveData } from "../utils/storage";
import { playSuccess } from "../utils/sound";
import { useToast } from "../components/ToastContext";

export default function WeightTracker() {
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState("");
  const showToast = useToast();

  useEffect(() => {
    setEntries(loadData("nz_weight_log", []));
  }, []);

  function logWeight(e) {
    e.preventDefault();
    if (!weight) return;
    const entry = { date: new Date().toISOString().slice(0, 10), value: Number(weight) };
    const updated = [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date));
    setEntries(updated);
    saveData("nz_weight_log", updated);
    setWeight("");
    playSuccess();
    showToast("Weight logged", "success");
  }

  const chartData = entries.slice(-7).map((e) => ({
    label: new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" }),
    value: e.value,
  }));

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const change = latest && previous ? (latest.value - previous.value).toFixed(1) : null;

  return (
    <div>
      <PageHeader icon={Weight} title="Weight Tracker" subtitle="Log your weight to see your trend over time." />

      <div className="card">
        <h3>Log Today's Weight</h3>
        <form onSubmit={logWeight} style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            step="0.1"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
          />
          <button className="btn btn-primary" type="submit">Log</button>
        </form>

        {latest && (
          <div style={{ marginTop: 16, display: "flex", gap: 20 }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Latest</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{latest.value} kg</div>
            </div>
            {change !== null && (
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Change</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: change > 0 ? "var(--color-warning)" : "var(--color-success)" }}>
                  {change > 0 ? "+" : ""}{change} kg
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={18} color="var(--accent-bmi-icon)" /> Weight Trend
        </h3>
        {chartData.length === 0 ? (
          <div className="empty-state">
            <Weight size={32} className="empty-icon" style={{ display: "block", margin: "0 auto 8px" }} />
            <p>Log your weight a few times to see your trend here.</p>
          </div>
        ) : (
          <WeeklyChart data={chartData} color="var(--accent-bmi-icon)" unit=" kg" />
        )}
      </div>
    </div>
  );
}
