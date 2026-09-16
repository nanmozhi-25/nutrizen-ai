// NutriZen AI Service Worker for Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'NutriZen AI Notification';
  const options = {
    body: data.message || 'You have a new wellness update.',
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
