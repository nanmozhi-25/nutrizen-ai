import mongoose from 'mongoose';

const RoutineSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  time: { type: String, default: '09:00' }, // HH:mm format
  completedDates: [{ type: String }], // Array of YYYY-MM-DD
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Routine || mongoose.model('Routine', RoutineSchema);
