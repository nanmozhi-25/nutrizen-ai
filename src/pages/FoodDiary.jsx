import { useState, useEffect } from "react";
import { BookOpen, UtensilsCrossed } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { loadData, todayKey } from "../utils/storage";

export default function FoodDiary() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(loadData(`nz_diary_${todayKey()}`, []));
  }, []);

  const totalCalories = entries.reduce((sum, e) => sum + Number(e.calories), 0);

  return (
    <div>
      <PageHeader icon={BookOpen} title="Food Diary" subtitle="Everything you've logged today, via Food Scanner." />

      <div className="card">
        <h3>Today's Total: {totalCalories} kcal</h3>

        {entries.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed size={32} className="empty-icon" style={{ display: "block", margin: "0 auto 8px" }} />
            <p>No entries yet. Go scan some food!</p>
          </div>
        ) : (
          entries.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <strong>{e.food}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{e.time}</div>
              </div>
              <div>{e.calories} kcal</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
