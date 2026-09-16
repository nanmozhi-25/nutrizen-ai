import connectToDatabase from '@/lib/mongodb';
import FoodLog from '@/models/FoodLog';
import HealthConcern from '@/models/HealthConcern';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId, date } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const query = { userId };
      if (date) query.date = date;

      const logs = await FoodLog.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ logs });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        userId, 
        name, 
        mealType, 
        calories, 
        protein, 
        carbs, 
        fat, 
        fiber, 
        sugar, 
        sodium, 
        detectedVia, 
        imageUrl, 
        date 
      } = req.body;

      if (!userId || !name || calories === undefined) {
        return res.status(400).json({ message: 'userId, name, and calories are required.' });
      }

      const logDate = date || new Date().toISOString().split('T')[0];

      const newLog = await FoodLog.create({
        userId,
        name,
        mealType: mealType || 'Lunch',
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0,
        sugar: Number(sugar) || 0,
        sodium: Number(sodium) || 0,
        detectedVia: detectedVia || 'manual',
        imageUrl,
        date: logDate
      });

      // --- REAL HEALTH CONCERN ALERT CHECK ---
      let healthAlertTriggered = null;

      const userConcern = await HealthConcern.findOne({ userId, active: true });
      if (userConcern && userConcern.concernType !== 'none') {
        const todayLogs = await FoodLog.find({ userId, date: logDate });
        const totalSugar = todayLogs.reduce((acc, f) => acc + (f.sugar || 0), 0);
        const totalSodium = todayLogs.reduce((acc, f) => acc + (f.sodium || 0), 0);

        const sugarLimit = userConcern.thresholds?.maxSugarGrams || 25;
        const sodiumLimit = userConcern.thresholds?.maxSodiumMg || 1500;

        if (userConcern.concernType === 'diabetes' && totalSugar > sugarLimit) {
          healthAlertTriggered = `⚠️ Health Alert (Diabetes): Today's sugar intake (${totalSugar}g) exceeded your recommended limit of ${sugarLimit}g!`;
        } else if (userConcern.concernType === 'hypertension' && totalSodium > sodiumLimit) {
          healthAlertTriggered = `⚠️ Health Alert (Hypertension): Today's sodium intake (${totalSodium}mg) exceeded your recommended limit of ${sodiumLimit}mg!`;
        } else if (userConcern.concernType === 'heart_health' && totalSodium > sodiumLimit) {
          healthAlertTriggered = `⚠️ Health Alert (Heart Health): High sodium detected (${totalSodium}mg). Consider lowering salt intake.`;
        }

        if (healthAlertTriggered) {
          await Notification.create({
            userId,
            title: 'Health Concern Threshold Breached',
            message: healthAlertTriggered,
            type: 'health_concern',
            read: false
          });
        }
      }

      return res.status(201).json({
        message: 'Food item logged successfully to MongoDB.',
        log: newLog,
        alert: healthAlertTriggered
      });
    } catch (err) {
      console.error('Error logging food:', err);
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id, userId } = req.query;
    if (!id || !userId) return res.status(400).json({ message: 'id and userId are required' });

    try {
      await FoodLog.deleteOne({ _id: id, userId });
      return res.status(200).json({ message: 'Food log entry deleted.' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
