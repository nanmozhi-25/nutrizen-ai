import webPush from 'web-push';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@nutrizen.ai';

if (publicVapidKey && privateVapidKey) {
  try {
    webPush.setVapidDetails(
      vapidSubject,
      publicVapidKey,
      privateVapidKey
    );
  } catch (e) {
    console.warn('VAPID key error:', e.message);
  }
}

export async function sendWebPushNotification(subscription, payload) {
  if (!publicVapidKey || !privateVapidKey) {
    console.log('Push notifications fallback mode (VAPID keys not configured).');
    return false;
  }

  try {
    await webPush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Error sending web push notification:', error);
    return false;
  }
}
