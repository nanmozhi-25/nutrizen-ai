import mongoose from 'mongoose';

const WeightLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  weight: { type: Number, required: true }, // kg
  height: { type: Number, required: true }, // cm
  bmi: { type: Number, required: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.WeightLog || mongoose.model('WeightLog', WeightLogSchema);
