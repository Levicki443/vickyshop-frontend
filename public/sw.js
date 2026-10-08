const CACHE_NAME = 'vickyshop-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ne pas intercepter les requêtes API ni Socket.io
  if (event.request.url.includes('/api/') || event.request.url.includes('/socket.io/')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((res) => res || null);
    })
  );
});

// Écoute et affichage des notifications Push natives du navigateur
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Vicky-Shop', body: event.data.text() };
    }
  }

  const title = data.title || 'Vicky-Shop Notification';
  const options = {
    body: data.body || 'Une mise à jour importante est disponible sur Vicky-Shop.',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    vibrate: [150, 80, 150],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open_url', title: 'Ouvrir' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Redirection au clic sur la notification native
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.registration.scope)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
