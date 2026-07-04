import { useState, useEffect } from "react";
import { UtensilsCrossed } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { loadData, saveData } from "../utils/storage";
import { playClick } from "../utils/sound";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEALS = ["Breakfast", "Lunch", "Dinner"];

const SUGGESTIONS = {
  Breakfast: ["Oats & fruits", "Idli & chutney", "Vegetable poha", "Greek yogurt & granola"],
  Lunch: ["Rice, dal & veggies", "Chapati & paneer curry", "Quinoa salad", "Curd rice & pickle"],
  Dinner: ["Grilled fish & salad", "Vegetable soup", "Khichdi", "Stir-fried tofu & greens"],
};

export default function MealPlanner() {
  const [plan, setPlan] = useState({});

  useEffect(() => {
    setPlan(loadData("nz_meal_plan", {}));
  }, []);

  function update(day, meal, value) {
    const updated = { ...plan, [day]: { ...plan[day], [meal]: value } };
    setPlan(updated);
    saveData("nz_meal_plan", updated);
  }

  function applySuggestion(day, meal, value) {
    update(day, meal, value);
    playClick();
  }

  return (
    <div>
      <PageHeader icon={UtensilsCrossed} title="Meal Planner" subtitle="Plan your meals for the week." />

      {DAYS.map((day) => (
        <div className="card" key={day}>
          <h3>{day}</h3>
          <div className="grid-2">
            {MEALS.map((meal) => (
              <div key={meal}>
                <label style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{meal}</label>
                <input
                  value={plan[day]?.[meal] || ""}
                  onChange={(e) => update(day, meal, e.target.value)}
                  placeholder={`What's for ${meal.toLowerCase()}?`}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    marginTop: 4,
                  }}
                />
                <div className="suggestion-chips" style={{ marginTop: 6 }}>
                  {SUGGESTIONS[meal].map((s) => (
                    <button
                      key={s}
                      className="suggestion-chip"
                      onClick={() => applySuggestion(day, meal, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
