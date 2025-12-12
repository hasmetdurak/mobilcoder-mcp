const CACHE_NAME = 'mobilecoder-mcp-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const CACHE_VERSION = '1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// API routes that should never be cached
const API_ROUTES = [
  '/api/',
  '/mcp-signal'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Static assets cached');
      self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v' + CACHE_VERSION);
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('[SW] Old caches cleaned up');
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip caching for API routes
  if (API_ROUTES.some(route => url.pathname.includes(route))) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle different strategies based on request type
  if (request.method === 'GET') {
    // Network-first for static assets, cache-first for API
    if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
      event.respondWith(
        caches.match(request).then((response) => {
          return response || fetch(request).then((fetchResponse) => {
            // Cache the new response
            if (fetchResponse.ok) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, fetchResponse.clone());
              });
            }
            return fetchResponse;
          });
        })
      );
    } else {
      // Cache-first strategy for dynamic content
      event.respondWith(
        caches.match(request).then((response) => {
          if (response) {
            // Update cache in background
            fetch(request).then((fetchResponse) => {
              if (fetchResponse.ok) {
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, fetchResponse.clone());
                });
              }
            });
            return response;
          } else {
            // Network fallback
            return fetch(request).then((fetchResponse) => {
              if (fetchResponse.ok) {
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, fetchResponse.clone());
                });
              }
              return fetchResponse;
            });
          }
        })
      );
    }
  } else {
    // For non-GET requests, always go to network
    event.respondWith(fetch(request));
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.body || '',
    icon: '/icons/icon-96x96.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(event.data?.title || 'MobileCoder MCP', options)
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline actions
      syncOfflineActions().then(() => {
        console.log('[SW] Background sync completed');
      })
    );
  }
});

// Sync offline actions
async function syncOfflineActions() {
  // Get all offline queued actions from IndexedDB
  const offlineActions = await getOfflineActions();
  
  for (const action of offlineActions) {
    try {
      switch (action.type) {
        case 'command':
          // Retry queued commands when back online
          await retryQueuedCommand(action.data);
          break;
        case 'message':
          // Sync messages
          await syncMessage(action.data);
          break;
      }
      
      // Remove processed action
      await removeOfflineAction(action.id);
    } catch (error) {
      console.error('[SW] Failed to sync offline action:', error);
    }
  }
}

// IndexedDB helpers for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MobileCoderOfflineDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function getOfflineActions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readonly');
    const store = transaction.objectStore('offlineActions');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function removeOfflineAction(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Message event for communication with app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic cleanup
setInterval(() => {
  caches.open(DYNAMIC_CACHE).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > 100) { // Limit cache size
        const keysToDelete = keys.slice(0, keys.length - 50);
        return Promise.all(keysToDelete.map(key => cache.delete(key)));
      }
    });
  });
}, 5 * 60 * 1000); // Every 5 minutes

console.log('[SW] Service worker loaded v' + CACHE_VERSION);