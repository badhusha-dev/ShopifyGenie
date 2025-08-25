// ShopifyApp Service Worker
const CACHE_NAME = 'shopifyapp-v1.0.0';
const STATIC_CACHE_NAME = 'shopifyapp-static-v1';
const API_CACHE_NAME = 'shopifyapp-api-v1';
const IMAGE_CACHE_NAME = 'shopifyapp-images-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/src/index.css',
  // Add other critical static assets here
];

// API endpoints to cache for offline functionality
const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/stats',
  '/api/products',
  '/api/customers', 
  '/api/orders',
  '/api/notifications',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// API request handler - Network first, then cache
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses for specific endpoints
      if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, response.clone());
      }
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: Network failed for API request, trying cache');
    
    // Try cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for critical API endpoints
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Image request handler - Cache first, then network
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image for offline
    return new Response('', { status: 404 });
  }
}

// Navigation request handler - Network first, then cache, then offline page
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Try cache for SPA routes
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match('/');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return cache.match('/offline') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Static request handler - Cache first, then network
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Service Worker: Failed to fetch static resource', request.url);
    return new Response('', { status: 404 });
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.message || 'New notification from ShopifyApp',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'general',
    requireInteraction: data.priority === 'high',
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-96x96.png'
      }
    ],
    data: {
      url: data.url || '/',
      ...data
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'ShopifyApp',
      options
    )
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const { action, data } = event;
  const url = data?.url || '/';
  
  if (action === 'dismiss') {
    return;
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync handler for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const db = await openOfflineDB();
    const tx = db.transaction(['actions'], 'readonly');
    const store = tx.objectStore('actions');
    const actions = await store.getAll();
    
    console.log(`Service Worker: Syncing ${actions.length} offline actions`);
    
    // Process each action
    for (const action of actions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action from offline storage
        const deleteTx = db.transaction(['actions'], 'readwrite');
        const deleteStore = deleteTx.objectStore('actions');
        await deleteStore.delete(action.id);
        
        console.log('Service Worker: Synced offline action', action.id);
      } catch (error) {
        console.error('Service Worker: Failed to sync action', action.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper function to open IndexedDB
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ShopifyAppOffline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

// Send message to clients
function sendMessageToClients(message) {
  return clients.matchAll()
    .then(clients => {
      clients.forEach(client => {
        client.postMessage(message);
      });
    });
}

console.log('Service Worker: Loaded and ready');