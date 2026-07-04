import { useEffect, useState } from "react";
import { Trophy, Medal, Award, UtensilsCrossed } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { loadData } from "../utils/storage";

const BADGES = [
  { id: "first_goal", label: "First Goal Set", icon: Medal, check: (g) => g.length >= 1 },
  { id: "goal_getter", label: "Goal Getter", icon: Award, check: (g) => g.filter((x) => x.done).length >= 1 },
  { id: "consistent", label: "5 Goals Completed", icon: Trophy, check: (g) => g.filter((x) => x.done).length >= 5 },
  { id: "planner", label: "Meal Planner Pro", icon: UtensilsCrossed, check: () => Object.keys(loadData("nz_meal_plan", {})).length >= 3 },
];

export default function Achievements() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    setGoals(loadData("nz_goals", []));
  }, []);

  return (
    <div>
      <PageHeader icon={Trophy} title="Achievements" subtitle="Badges you've earned on your journey." />

      <div className="grid-2">
        {BADGES.map((b) => {
          const earned = b.check(goals);
          const Icon = b.icon;
          return (
            <div key={b.id} className="card" style={{ textAlign: "center", opacity: earned ? 1 : 0.5, background: earned ? "var(--accent-achievements-bg)" : "var(--color-surface)", border: earned ? "none" : "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "center", color: earned ? "var(--accent-achievements-icon)" : "var(--color-text-muted)" }}>
                <Icon size={40} strokeWidth={1.5} />
              </div>
              <h3 style={{ justifyContent: "center" }}>{b.label}</h3>
              <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
                {earned ? "Unlocked" : "Not yet unlocked"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
