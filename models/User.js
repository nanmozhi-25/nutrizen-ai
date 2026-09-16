import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    age: { type: Number, default: 25 },
    gender: { type: String, default: 'Prefer not to say' },
    height: { type: Number, default: 170 }, // cm
    weight: { type: Number, default: 70 }, // kg
    bmi: { type: Number, default: 24.2 },
    activityLevel: { type: String, default: 'Moderate' },
    dietaryPreference: { type: String, default: 'Balanced' },
    allergies: [{ type: String }],
    healthGoals: { type: String, default: 'Maintain Health' },
    waterGoal: { type: Number, default: 2000 }, // ml
    sleepGoal: { type: Number, default: 8.0 }, // hours
    meditationGoal: { type: Number, default: 15 } // minutes
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
