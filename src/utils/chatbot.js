// Simple keyword-routed chatbot "brain". No external AI API — pure rules
// over the user's own data, kept honest and fast (same philosophy as the
// recommendation engine).

const MEAL_IDEAS = [
  "Grilled chicken with quinoa and steamed vegetables",
  "Dal, brown rice, and a side salad",
  "Greek yogurt with fruit and a handful of nuts",
  "Vegetable stir-fry with tofu",
  "Oats with banana and peanut butter",
];

const SLEEP_TIPS = [
  "Keep a consistent sleep and wake time, even on weekends.",
  "Avoid screens for 30-60 minutes before bed — blue light delays melatonin.",
  "Keep your room cool and dark; both help sleep onset.",
  "Avoid caffeine after early afternoon.",
];

const WEIGHT_LOSS_TIPS = [
  "Aim for a moderate calorie deficit (300-500 kcal/day) rather than an extreme one.",
  "Prioritize protein at each meal — it helps preserve muscle and keeps you fuller longer.",
  "Combine cardio with light strength training for better long-term results.",
  "Track consistently — the Calorie Tracker and Weight Tracker here can help you see real trends.",
];

export function getBotResponse(message, context = {}) {
  const text = message.toLowerCase();
  const { remainingCalories, waterRemaining, waterGoal } = context;

  if (/(meal|eat|food|lunch|dinner|breakfast)/.test(text)) {
    const idea = MEAL_IDEAS[Math.floor(Math.random() * MEAL_IDEAS.length)];
    if (remainingCalories !== undefined && remainingCalories > 0) {
      return `Based on your remaining ${remainingCalories} kcal today, try: ${idea}. You can log it directly in Food Scanner or Calorie Tracker.`;
    }
    return `Here's an idea: ${idea}. Log it in Food Scanner or Calorie Tracker to track it.`;
  }

  if (/(calorie|calculate|tdee|maintenance)/.test(text)) {
    return "A simple estimate: Basal Metabolic Rate (BMR) × activity factor gives your daily maintenance calories. For weight loss, eat 300-500 kcal below that; for muscle gain, eat 200-300 kcal above it. Use the Calorie Tracker to log your intake and compare against your goal.";
  }

  if (/sleep/.test(text)) {
    const tip = SLEEP_TIPS[Math.floor(Math.random() * SLEEP_TIPS.length)];
    return `Sleep tip: ${tip}`;
  }

  if (/(weight loss|lose weight|fat loss)/.test(text)) {
    const tip = WEIGHT_LOSS_TIPS[Math.floor(Math.random() * WEIGHT_LOSS_TIPS.length)];
    return `${tip}`;
  }

  if (/water|hydrat/.test(text)) {
    if (waterRemaining !== undefined && waterRemaining > 0) {
      return `You have ${waterRemaining} of ${waterGoal} glasses left today. Try setting a reminder every 2 hours, or keep a bottle visible on your desk.`;
    }
    return "Try keeping a water bottle within sight, and drink a glass before every meal — it's an easy way to build the habit.";
  }

  if (/(bmi|body mass)/.test(text)) {
    return "You can calculate your BMI on the BMI Calculator page. As a rough guide: under 18.5 is underweight, 18.5-24.9 is normal, 25-29.9 is overweight, and 30+ is obese — but it's just one signal, not a full health picture.";
  }

  if (/(goal|habit|motivat)/.test(text)) {
    return "Small, specific goals tend to stick better than big vague ones. Try setting one this week on the Goals page — even something like 'drink 8 glasses of water daily'.";
  }

  if (/(meditat|stress|breath|calm|anxious)/.test(text)) {
    return "A quick reset: try the Breathing page for a 4-4-4-4 box breathing exercise, or a short guided session on the Meditation page.";
  }

  if (/(hi|hello|hey)/.test(text)) {
    return "Hi! I can help with meal ideas, calorie estimates, sleep tips, weight loss guidance, and hydration reminders. What would you like to know?";
  }

  return "I can help with meal suggestions, calorie calculations, sleep tips, weight loss plans, and water reminders — try asking about one of those, or check the Recommendations page for insights based on your own data.";
}

export const QUICK_QUESTIONS = [
  "Suggest today's meal",
  "Calculate my calories",
  "Improve my sleep",
  "Weight loss plan",
  "Water reminder",
];
