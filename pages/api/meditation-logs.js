import connectToDatabase from '@/lib/mongodb';
import MeditationLog from '@/models/MeditationLog';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const logs = await MeditationLog.find({ userId }).sort({ createdAt: -1 }).limit(30);
      const totalMinutes = logs.reduce((acc, m) => acc + m.durationMinutes, 0);

      return res.status(200).json({ logs, totalMinutes });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, routineType, durationMinutes, date } = req.body;
      if (!userId || !durationMinutes) {
        return res.status(400).json({ message: 'userId and durationMinutes are required.' });
      }

      const logDate = date || new Date().toISOString().split('T')[0];

      const newLog = await MeditationLog.create({
        userId,
        routineType: routineType || 'box_breathing',
        durationMinutes: Number(durationMinutes),
        completed: true,
        date: logDate
      });

      return res.status(201).json({ message: 'Meditation session saved to MongoDB', log: newLog });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
