import mongoose from 'mongoose';

const FoodLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'], default: 'Lunch' },
  calories: { type: Number, required: true, default: 0 },
  protein: { type: Number, default: 0 }, // g
  carbs: { type: Number, default: 0 }, // g
  fat: { type: Number, default: 0 }, // g
  fiber: { type: Number, default: 0 }, // g
  sugar: { type: Number, default: 0 }, // g
  sodium: { type: Number, default: 0 }, // mg
  detectedVia: { type: String, enum: ['manual', 'ai_scanner', 'usda_search'], default: 'manual' },
  imageUrl: { type: String },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.FoodLog || mongoose.model('FoodLog', FoodLogSchema);
