import { saveData, todayKey } from "./storage";

// Runs once (checks a flag) to populate localStorage with realistic sample
// data so the app looks full and alive on first open, instead of empty.
export function seedDemoData() {
  if (localStorage.getItem("nz_seeded")) return;

  const today = todayKey();

  saveData(`nz_diary_${today}`, [
    { food: "Idli & Sambar", calories: 240, protein: 8, carbs: 42, fat: 4, time: "8:05 AM" },
    { food: "Grilled Chicken Salad", calories: 320, protein: 28, carbs: 12, fat: 16, time: "1:20 PM" },
    { food: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, time: "4:00 PM" },
  ]);

  saveData(`nz_calories_${today}`, [
    { food: "Idli & Sambar", calories: 240 },
    { food: "Grilled Chicken Salad", calories: 320 },
    { food: "Apple", calories: 95 },
  ]);
  saveData("nz_calorie_goal", 2000);

  saveData(`nz_water_${today}`, 4);
  saveData("nz_water_goal", 8);

  saveData("nz_goals", [
    { id: 1, text: "Drink 8 glasses of water daily", done: false },
    { id: 2, text: "Walk 30 minutes every day", done: true },
    { id: 3, text: "Meditate for 10 minutes", done: true },
    { id: 4, text: "Eat 2 servings of vegetables", done: false },
    { id: 5, text: "Sleep 7+ hours", done: true },
  ]);

  saveData("nz_meal_plan", {
    Monday: { Breakfast: "Oats & fruits", Lunch: "Rice, dal, veggies", Dinner: "Grilled fish & salad" },
    Tuesday: { Breakfast: "Idli & chutney", Lunch: "Chapati & paneer curry", Dinner: "Vegetable soup" },
    Wednesday: { Breakfast: "Poha", Lunch: "Curd rice & pickle", Dinner: "Khichdi" },
  });

  localStorage.setItem("nz_seeded", "true");
}
