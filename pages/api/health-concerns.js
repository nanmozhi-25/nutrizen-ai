import connectToDatabase from '@/lib/mongodb';
import HealthConcern from '@/models/HealthConcern';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      let concern = await HealthConcern.findOne({ userId, active: true });
      if (!concern) {
        concern = await HealthConcern.create({
          userId,
          concernType: 'none',
          thresholds: { maxSugarGrams: 25, maxSodiumMg: 1500, maxSaturatedFatGrams: 15, maxCarbsGrams: 150 }
        });
      }
      return res.status(200).json({ concern });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { userId, concernType, thresholds } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId is required' });

      let concern = await HealthConcern.findOne({ userId });
      if (!concern) {
        concern = new HealthConcern({ userId });
      }

      if (concernType) concern.concernType = concernType;
      if (thresholds) concern.thresholds = { ...concern.thresholds, ...thresholds };
      concern.active = true;

      await concern.save();
      return res.status(200).json({ message: 'Health concern settings saved in MongoDB', concern });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
