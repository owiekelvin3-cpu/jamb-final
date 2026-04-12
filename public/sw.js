const CACHE_NAME = 'jamb-learning-v2';
const STATIC_CACHE = 'jamb-learning-static-v2';
const RUNTIME_CACHE = 'jamb-learning-runtime-v2';

// Essential files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching essential files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', request.url);
          return response;
        }

        // Otherwise, fetch from network and cache
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be used once
            const responseToCache = response.clone();
            
            // Cache the fetched resource
            if (request.url.includes('/static/') || 
                request.url.endsWith('.js') || 
                request.url.endsWith('.css') ||
                request.url.endsWith('.png') ||
                request.url.endsWith('.jpg') ||
                request.url.endsWith('.ico')) {
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  console.log('Service Worker: Caching new resource', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch(() => {
            // If network fails, try to serve from runtime cache
            console.log('Service Worker: Network failed, trying runtime cache');
            return caches.match(request);
          });
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (request.mode === 'navigate') {
          console.log('Service Worker: Serving offline page');
          return caches.match('/index.html');
        }
      })
  );
});
