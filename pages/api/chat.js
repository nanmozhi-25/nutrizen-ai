import connectToDatabase from '@/lib/mongodb';
import ChatHistory from '@/models/ChatHistory';
import User from '@/models/User';
import { generateChatResponse } from '@/lib/gemini';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    await connectToDatabase();
    try {
      const history = await ChatHistory.findOne({ userId });
      return res.status(200).json({ messages: history ? history.messages : [] });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, message, userProfile } = req.body;

      if (!userId || !message) {
        return res.status(400).json({ message: 'userId and message are required.' });
      }

      await connectToDatabase();

      // Find or create chat history
      let chat = await ChatHistory.findOne({ userId });
      if (!chat) {
        chat = new ChatHistory({ userId, messages: [] });
      }

      // Append user message
      chat.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Get user profile if not passed
      let profile = userProfile;
      if (!profile) {
        const user = await User.findById(userId);
        if (user && user.profile) profile = user.profile;
      }

      // Generate Gemini response
      const aiResult = await generateChatResponse(chat.messages, profile || {});

      const modelReply = aiResult.reply || 'I am processing your nutrition request.';

      // Append AI response
      chat.messages.push({
        role: 'model',
        content: modelReply,
        timestamp: new Date()
      });

      chat.updatedAt = new Date();
      await chat.save();

      return res.status(200).json({
        success: true,
        reply: modelReply,
        messages: chat.messages
      });
    } catch (err) {
      console.error('Chat endpoint error:', err);
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
