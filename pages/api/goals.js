import connectToDatabase from '@/lib/mongodb';
import Goal from '@/models/Goal';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
      const completedCount = goals.filter(g => g.completed).length;
      const totalCount = goals.length;

      return res.status(200).json({
        goals,
        summary: `${completedCount}/${totalCount} completed`,
        completedCount,
        totalCount
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, text, category, targetDate } = req.body;
      if (!userId || !text) {
        return res.status(400).json({ message: 'userId and text are required.' });
      }

      const newGoal = await Goal.create({
        userId,
        text,
        category: category || 'daily',
        targetDate: targetDate || new Date().toISOString().split('T')[0],
        completed: false
      });

      return res.status(201).json({ message: 'Goal added to MongoDB', goal: newGoal });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { goalId, completed, userId } = req.body;
      if (!goalId || !userId) {
        return res.status(400).json({ message: 'goalId and userId are required.' });
      }

      const goal = await Goal.findOne({ _id: goalId, userId });
      if (!goal) return res.status(404).json({ message: 'Goal not found.' });

      goal.completed = completed !== undefined ? completed : !goal.completed;
      await goal.save();

      return res.status(200).json({ message: 'Goal status updated in MongoDB', goal });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { goalId, userId } = req.query;
    if (!goalId || !userId) return res.status(400).json({ message: 'goalId and userId required' });

    try {
      await Goal.deleteOne({ _id: goalId, userId });
      return res.status(200).json({ message: 'Goal deleted.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
