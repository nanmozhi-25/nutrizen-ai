import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import WaterLog from '@/models/WaterLog';
import Notification from '@/models/Notification';
import Routine from '@/models/Routine';

export default async function handler(req, res) {
  // 1. Verify CRON_SECRET for security
  const cronSecret = process.env.CRON_SECRET || 'nutrizen_cron_secret_key_2026';
  const providedSecret = req.query.secret || req.headers['x-cron-secret'] || (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);

  if (providedSecret !== cronSecret) {
    return res.status(401).json({ message: 'Unauthorized. Invalid CRON_SECRET.' });
  }

  await connectToDatabase();

  try {
    const today = new Date().toISOString().split('T')[0];
    const users = await User.find({}).limit(100);

    let createdCount = 0;

    for (const user of users) {
      // Check 1: Hydration Reminder (If user logged 0 water today)
      const waterLogs = await WaterLog.find({ userId: user._id, date: today });
      const totalWater = waterLogs.reduce((acc, w) => acc + w.amountMl, 0);

      if (totalWater < 500) {
        const existingWaterNotif = await Notification.findOne({
          userId: user._id,
          type: 'routine_reminder',
          title: 'Hydration Alert',
          createdAt: { $gte: new Date(today) }
        });

        if (!existingWaterNotif) {
          await Notification.create({
            userId: user._id,
            title: 'Hydration Alert',
            message: `Stay hydrated! You have only logged ${totalWater}ml of water today out of your target ${user.profile?.waterGoal || 2000}ml.`,
            type: 'routine_reminder',
            read: false
          });
          createdCount++;
        }
      }

      // Check 2: Uncompleted Routines
      const routines = await Routine.find({ userId: user._id, active: true });
      for (const r of routines) {
        if (!r.completedDates.includes(today)) {
          const existingNotif = await Notification.findOne({
            userId: user._id,
            title: `Reminder: ${r.title}`,
            createdAt: { $gte: new Date(today) }
          });

          if (!existingNotif) {
            await Notification.create({
              userId: user._id,
              title: `Reminder: ${r.title}`,
              message: `Don't forget to complete your daily routine "${r.title}" scheduled for ${r.time || 'today'}!`,
              type: 'routine_reminder',
              read: false
            });
            createdCount++;
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Checked reminders for ${users.length} users. Created ${createdCount} new notifications.`,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error running reminder cron job:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
