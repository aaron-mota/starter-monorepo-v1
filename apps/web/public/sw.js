// Service Worker for push notifications

self.addEventListener('push', (event) => {
  const defaultData = { title: 'Starter App', body: 'You have a new notification', url: '/dashboard' };

  let data = defaultData;
  try {
    data = event.data ? { ...defaultData, ...event.data.json() } : defaultData;
  } catch {
    // If parsing fails, use default data
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url || '/dashboard' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(self.clients.openWindow(url));
});
