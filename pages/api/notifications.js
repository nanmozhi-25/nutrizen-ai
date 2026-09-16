import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';

export default async function handler(req, res) {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
      const unreadCount = notifications.filter(n => !n.read).length;

      return res.status(200).json({ notifications, unreadCount });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { notificationId, userId, markAllRead } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId is required' });

      if (markAllRead) {
        await Notification.updateMany({ userId }, { read: true });
        return res.status(200).json({ message: 'All notifications marked as read' });
      }

      if (notificationId) {
        await Notification.updateOne({ _id: notificationId, userId }, { read: true });
        return res.status(200).json({ message: 'Notification marked as read' });
      }

      return res.status(400).json({ message: 'Missing parameters' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
