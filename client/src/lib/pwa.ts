// PWA utility functions
import React from 'react';
import { apiRequest } from './queryClient';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineActions: Array<{
    id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
    timestamp: number;
  }> = [];

  constructor() {
    this.init();
  }

  private async init() {
    // PWA functionality completely disabled to prevent fetch errors
    console.log('PWA functionality disabled');
    return;
    
    // Register service worker
    await this.registerServiceWorker();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize push notifications
    await this.initializePushNotifications();
    
    // Setup offline support
    this.setupOfflineSupport();
  }

  private async registerServiceWorker(): Promise<void> {
    // Temporarily disabled to prevent fetch errors
    console.log('Service Worker registration disabled temporarily');
    return;
    
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available
                  this.showUpdateAvailable();
                }
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupEventListeners(): void {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallButton();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineActions();
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineStatus();
    });

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }
  }

  private async initializePushNotifications(): Promise<void> {
    try {
      if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted' && this.registration) {
          try {
            // Get or create push subscription
            let subscription = await this.registration.pushManager.getSubscription();
            
            if (!subscription) {
              // Generate VAPID keys - in production, these should be generated on the server
              const vapidPublicKey = 'BGsyHCqFdFz4vF4jV4d9YY5SnJ5FhJ5rUTkJj4FjXk9L5Mj8rJfvH2Jm3l7vD4';
              
              subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
              });
            }
          
            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
          } catch (error) {
            console.error('Push notification setup failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('Push notification initialization failed:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      p256dhKey: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
      authKey: this.arrayBufferToBase64(subscription.getKey('auth')!)
    };

    try {
      await apiRequest('POST', '/api/push/subscribe', subscriptionData);
      console.log('Push subscription sent to server');
    } catch (error) {
      console.error('Failed to send push subscription to server:', error);
    }
  }

  private setupOfflineSupport(): void {
    // Setup IndexedDB for offline storage
    this.initIndexedDB();
    
    // Override fetch for offline support
    this.setupOfflineInterceptor();
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShopifyAppOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('actions')) {
          db.createObjectStore('actions', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private setupOfflineInterceptor(): void {
    // This would typically be handled by the service worker
    // But we can add client-side logic for immediate feedback
  }

  public async installApp(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      
      this.deferredPrompt = null;
    }
  }

  public async updateApp(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload to apply update
      window.location.reload();
    }
  }

  public async isAppInstallable(): Promise<boolean> {
    try {
      return this.deferredPrompt !== null;
    } catch (error) {
      console.debug('Error checking app installability:', error);
      return false;
    }
  }

  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async addToOfflineQueue(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
  }): Promise<void> {
    const action = {
      id: crypto.randomUUID(),
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
      timestamp: Date.now()
    };

    this.offlineActions.push(action);

    // Store in IndexedDB
    const db = await this.openIndexedDB();
    const tx = db.transaction(['actions'], 'readwrite');
    const store = tx.objectStore('actions');
    await store.add(action);

    console.log('Added action to offline queue:', action.id);
  }

  private async syncOfflineActions(): Promise<void> {
    if (!this.isOnline) return;

    const db = await this.openIndexedDB();
    const tx = db.transaction(['actions'], 'readonly');
    const store = tx.objectStore('actions');
    const actions = await store.getAll();

    console.log(`Syncing ${actions.length} offline actions`);

    for (const action of actions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        // Remove from IndexedDB on success
        const deleteTx = db.transaction(['actions'], 'readwrite');
        const deleteStore = deleteTx.objectStore('actions');
        await deleteStore.delete(action.id);

        console.log('Synced offline action:', action.id);
      } catch (error) {
        console.error('Failed to sync action:', action.id, error);
      }
    }
  }

  private async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShopifyAppOffline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case 'UPDATE_AVAILABLE':
        this.showUpdateAvailable();
        break;
      case 'OFFLINE_STATUS':
        this.showOfflineStatus();
        break;
      default:
        console.log('Unknown service worker message:', data);
    }
  }

  private showInstallButton(): void {
    // Show install button in UI
    const installButton = document.querySelector('[data-pwa-install]');
    if (installButton) {
      installButton.classList.remove('hidden');
    }
  }

  private hideInstallButton(): void {
    const installButton = document.querySelector('[data-pwa-install]');
    if (installButton) {
      installButton.classList.add('hidden');
    }
  }

  private showUpdateAvailable(): void {
    // Show update notification
    console.log('App update available');
    // You could show a toast or modal here
  }

  private showOnlineStatus(): void {
    console.log('App is online');
    // Update UI to show online status
  }

  private showOfflineStatus(): void {
    console.log('App is offline');
    // Update UI to show offline status
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Singleton instance - DISABLED to prevent service worker issues
// export const pwaManager = new PWAManager();
export const pwaManager = null;

// React hook for PWA functionality
export function usePWA() {
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Temporarily disable all PWA functionality to stop unhandled rejections
  React.useEffect(() => {
    // Simple online/offline detection without PWA manager
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return {
    isInstallable: false, // Disabled temporarily
    isOnline,
    installApp: () => Promise.resolve(false),
    updateApp: () => Promise.resolve(),
    addToOfflineQueue: () => {}
  };
}