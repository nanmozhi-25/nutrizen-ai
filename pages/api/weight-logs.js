import connectToDatabase from '@/lib/mongodb';
import WeightLog from '@/models/WeightLog';
import User from '@/models/User';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const logs = await WeightLog.find({ userId }).sort({ createdAt: -1 }).limit(30);
      return res.status(200).json({ logs });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, weight, height, date } = req.body;
      if (!userId || !weight || !height) {
        return res.status(400).json({ message: 'userId, weight (kg), and height (cm) are required.' });
      }

      const hMeters = Number(height) / 100;
      const bmi = parseFloat((Number(weight) / (hMeters * hMeters)).toFixed(1));
      const logDate = date || new Date().toISOString().split('T')[0];

      const newLog = await WeightLog.create({
        userId,
        weight: Number(weight),
        height: Number(height),
        bmi,
        date: logDate
      });

      // Update user profile height, weight, bmi
      await User.updateOne(
        { _id: userId },
        { 
          'profile.weight': Number(weight),
          'profile.height': Number(height),
          'profile.bmi': bmi
        }
      );

      return res.status(201).json({ message: 'Weight entry saved to MongoDB', log: newLog, bmi });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
