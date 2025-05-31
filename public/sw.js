
// Service Worker for handling push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Focus or open the app window
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;
    
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      badge: '/lovable-uploads/7fa491aa-0c1b-4b64-a399-eb37394c4c0f.png',
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Order'
        }
      ]
    });
  }
});
