import connectToDatabase from '@/lib/mongodb';
import Routine from '@/models/Routine';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const today = new Date().toISOString().split('T')[0];
      const routines = await Routine.find({ userId, active: true });

      // Check for missed routines yesterday/today and create notifications
      for (const r of routines) {
        if (!r.completedDates.includes(today)) {
          // Check if notification already exists for today
          const existingNotif = await Notification.findOne({
            userId,
            title: `Routine Reminder: ${r.title}`,
            createdAt: { $gte: new Date(today) }
          });

          if (!existingNotif) {
            await Notification.create({
              userId,
              title: `Routine Reminder: ${r.title}`,
              message: `Don't forget to complete your routine "${r.title}" scheduled for ${r.time || 'today'}!`,
              type: 'routine_reminder',
              read: false
            });
          }
        }
      }

      return res.status(200).json({ routines });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { userId, title, time } = req.body;
      if (!userId || !title) {
        return res.status(400).json({ message: 'userId and title are required.' });
      }

      const newRoutine = await Routine.create({
        userId,
        title,
        time: time || '09:00',
        completedDates: [],
        active: true
      });

      return res.status(201).json({ message: 'Routine created', routine: newRoutine });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { routineId, userId } = req.body;
      const today = new Date().toISOString().split('T')[0];

      const routine = await Routine.findOne({ _id: routineId, userId });
      if (!routine) return res.status(404).json({ message: 'Routine not found' });

      if (routine.completedDates.includes(today)) {
        routine.completedDates = routine.completedDates.filter(d => d !== today);
      } else {
        routine.completedDates.push(today);
      }

      await routine.save();
      return res.status(200).json({ message: 'Routine updated', routine });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
