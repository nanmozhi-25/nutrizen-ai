import mongoose from 'mongoose';

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.ChatHistory || mongoose.model('ChatHistory', ChatHistorySchema);
