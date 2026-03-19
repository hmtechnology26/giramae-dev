// OneSignal Service Worker
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js');
} catch (error) {
  // Fallback básico se o CDN falhar
  self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    try {
      const data = event.data.json();
      const options = {
        body: data.message || data.body || 'Nova notificação',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'default',
        data: data,
        requireInteraction: false
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'GiraMãe', options)
      );
    } catch (parseError) {
      // Erro silencioso
    }
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'dismiss') {
      return;
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  });
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});