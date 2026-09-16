import mongoose from 'mongoose';

const HealthConcernSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  concernType: { 
    type: String, 
    enum: ['diabetes', 'hypertension', 'heart_health', 'high_cholesterol', 'kidney_health', 'weight_loss', 'none'], 
    default: 'none' 
  },
  thresholds: {
    maxSugarGrams: { type: Number, default: 25 }, // Daily limit
    maxSodiumMg: { type: Number, default: 1500 }, // Daily limit
    maxSaturatedFatGrams: { type: Number, default: 15 },
    maxCarbsGrams: { type: Number, default: 150 }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.HealthConcern || mongoose.model('HealthConcern', HealthConcernSchema);
