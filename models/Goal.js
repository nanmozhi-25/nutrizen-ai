import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  category: { type: String, enum: ['daily', 'weekly', 'milestone'], default: 'daily' },
  targetDate: { type: String }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
