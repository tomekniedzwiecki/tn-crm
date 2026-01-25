// TN CRM Service Worker
const CACHE_NAME = 'tn-crm-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache for static assets only
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip external resources
  if (url.origin !== location.origin) return;

  // Skip API calls and auth endpoints
  if (url.pathname.includes('/rest/') || url.pathname.includes('/auth/')) return;

  // Skip HTML pages (require authentication) - only cache static assets
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) return;

  // Skip requests with authorization headers (authenticated requests)
  if (event.request.headers.get('authorization')) return;

  // Only cache static assets (js, css, images, fonts)
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses for static assets only
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(event.request);
      })
  );
});
