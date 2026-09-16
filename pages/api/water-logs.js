import connectToDatabase from '@/lib/mongodb';
import WaterLog from '@/models/WaterLog';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId, date } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const today = date || new Date().toISOString().split('T')[0];
      const logs = await WaterLog.find({ userId, date: today }).sort({ createdAt: -1 });
      const totalMl = logs.reduce((acc, w) => acc + w.amountMl, 0);

      return res.status(200).json({ logs, totalMl, date: today });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, amountMl, date } = req.body;
      if (!userId || amountMl === undefined) {
        return res.status(400).json({ message: 'userId and amountMl are required.' });
      }

      const logDate = date || new Date().toISOString().split('T')[0];

      const newLog = await WaterLog.create({
        userId,
        amountMl: Number(amountMl),
        date: logDate
      });

      return res.status(201).json({ message: 'Water intake logged to MongoDB', log: newLog });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.query;
    if (!id || !userId) return res.status(400).json({ message: 'id and userId are required' });

    try {
      await WaterLog.deleteOne({ _id: id, userId });
      return res.status(200).json({ message: 'Water log deleted' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
