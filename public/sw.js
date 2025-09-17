// Service Worker for SIH Jury Marking System - Enhanced Version
const CACHE_NAME = 'sih-jury-v2.0.0';
const STATIC_CACHE = 'sih-static-v2.0.0';
const DYNAMIC_CACHE = 'sih-dynamic-v2.0.0';
const EXCEL_CACHE = 'sih-excel-v2.0.0';

// Cache different types of assets with different strategies
const CACHE_CONFIG = {
  static: {
    name: STATIC_CACHE,
    urls: [
      '/',
      '/manifest.json',
      // Core CSS and JS will be added dynamically
    ],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxEntries: 100,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  excel: {
    name: EXCEL_CACHE,
    maxEntries: 10,
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  }
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2.0.0');
  event.waitUntil(
    caches.open(CACHE_CONFIG.static.name)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(CACHE_CONFIG.static.urls);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and localhost requests
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('localhost:')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }

        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response as it can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/offline.html') || 
                     new Response('Application is offline. Please check your connection.', {
                       status: 503,
                       statusText: 'Service Unavailable',
                       headers: { 'Content-Type': 'text/plain' }
                     });
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'evaluation-sync') {
    event.waitUntil(syncEvaluations());
  }
});

// Function to sync pending evaluations when online
async function syncEvaluations() {
  try {
    // Get pending evaluations from IndexedDB
    const pendingEvaluations = await getPendingEvaluations();
    
    for (const evaluation of pendingEvaluations) {
      try {
        // Attempt to sync evaluation
        await fetch('/api/evaluations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(evaluation)
        });
        
        // Remove from pending list if successful
        await removePendingEvaluation(evaluation.id);
        console.log('[SW] Synced evaluation:', evaluation.id);
      } catch (error) {
        console.error('[SW] Failed to sync evaluation:', evaluation.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Error during evaluation sync:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingEvaluations() {
  // Placeholder - implement IndexedDB operations
  return [];
}

async function removePendingEvaluation(id) {
  // Placeholder - implement IndexedDB operations
  console.log('[SW] Removing pending evaluation:', id);
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SIH Jury System', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});