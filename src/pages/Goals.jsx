import { useState, useEffect } from "react";
import { Target, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { SkeletonBlock } from "../components/Skeleton";
import { fetchGoals, createGoal, toggleGoal, deleteGoal } from "../utils/api";
import { playAchievement, playError, playClick } from "../utils/sound";
import { sendNotification } from "../utils/notifications";
import { useToast } from "../components/ToastContext";

const GOAL_TEMPLATES = [
  "Drink 8 glasses of water daily",
  "Walk 30 minutes every day",
  "Meditate for 10 minutes",
  "Eat 2 servings of vegetables",
  "Sleep 7+ hours",
  "Avoid sugary drinks for a week",
];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const showToast = useToast();

  useEffect(() => {
    fetchGoals()
      .then(setGoals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function addGoal(e, value) {
    if (e) e.preventDefault();
    const goalText = (value ?? text).trim();
    if (!goalText) return;
    try {
      const goal = await createGoal(goalText);
      setGoals((prev) => [...prev, goal]);
      setText("");
      playClick();
      showToast("Goal added", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  async function toggle(id) {
    try {
      const updated = await toggleGoal(id);
      setGoals((prev) => prev.map((g) => (g._id === id ? updated : g)));
      if (updated.done) {
        playAchievement();
        sendNotification("Goal Completed", updated.text);
        showToast("Goal completed! Great work.", "success");
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  async function remove(id) {
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      playError();
      showToast("Goal removed", "info");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    }
  }

  const activeTemplates = GOAL_TEMPLATES.filter(
    (t) => !goals.some((g) => g.text === t)
  );

  return (
    <div>
      <PageHeader icon={Target} title="Goals" subtitle="Set and track your personal health goals." />

      {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}

      <div className="card">
        <form onSubmit={addGoal} style={{ display: "flex", gap: 10 }}>
          <input
            placeholder="e.g. Drink 8 glasses of water daily"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--color-border)" }}
          />
          <button className="btn btn-primary" type="submit">Add Goal</button>
        </form>

        {activeTemplates.length > 0 && (
          <div className="suggestion-chips">
            {activeTemplates.map((t) => (
              <button key={t} className="suggestion-chip" onClick={() => addGoal(null, t)}>
                + {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        {loading && (
          <>
            <SkeletonBlock height={20} style={{ marginBottom: 10 }} />
            <SkeletonBlock height={20} style={{ marginBottom: 10 }} />
            <SkeletonBlock height={20} />
          </>
        )}

        {!loading && goals.length === 0 && (
          <div className="empty-state">
            <Target size={32} className="empty-icon" style={{ display: "block", margin: "0 auto 8px" }} />
            <p>No goals yet. Add your first one above!</p>
          </div>
        )}
        {goals.map((g) => (
          <div
            key={g._id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <input type="checkbox" checked={g.done} onChange={() => toggle(g._id)} />
            <span style={{ flex: 1, textDecoration: g.done ? "line-through" : "none", color: g.done ? "var(--color-text-muted)" : "inherit" }}>
              {g.text}
            </span>
            <button
              onClick={() => remove(g._id)}
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--color-danger)", display: "flex" }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
