import mongoose from 'mongoose';

const MeditationLogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  routineType: { type: String, enum: ['box_breathing', '478_breathing', 'guided_meditation', 'mindfulness'], default: 'box_breathing' },
  durationMinutes: { type: Number, required: true, default: 5 },
  completed: { type: Boolean, default: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.MeditationLog || mongoose.model('MeditationLog', MeditationLogSchema);
