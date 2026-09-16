import mongoose from 'mongoose';

const WaterLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  amountMl: { type: Number, required: true }, // e.g. 250, 500, 1000
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.WaterLog || mongoose.model('WaterLog', WaterLogSchema);
