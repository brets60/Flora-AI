const CACHE_NAME = 'agrimate-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/_expo/static/js/web/entry-ebab37cca782f25862964545b6d86fcd.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[AgriMate SW] Pre-caching offline shell');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API calls: Network-first, fallback to offline JSON if offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        if (url.pathname === '/api/health') {
          return new Response(JSON.stringify({ status: 'offline', mode: 'standalone' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ offline: true, message: 'Offline mode active.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For app navigation and static assets: Cache-first, fallback to network, fallback to /index.html
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to index.html for SPA routing offline
        return caches.match('/index.html');
      });
    })
  );
});
