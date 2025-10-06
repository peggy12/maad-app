/**
 * Service Worker Registration for MAAD App
 * Enables offline capabilities and performance caching
 */

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker update found');

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('🎉 New version available! Please refresh.');
            
            // Optionally show update notification
            if (confirm('A new version is available. Refresh now?')) {
              window.location.reload();
            }
          }
        });
      });

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('⚠️ Service Workers not supported');
    return null;
  }
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('✅ Service Worker unregistered');
    }
  }
}

export async function clearServiceWorkerCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('🗑️ Service Worker cache cleared');
  }
}

// Request background sync
export async function requestBackgroundSync(tag: string = 'sync-data') {
  if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log('🔄 Background sync requested:', tag);
    } catch (error) {
      console.error('❌ Background sync failed:', error);
    }
  }
}

// Check if app is running in standalone mode (PWA)
export function isPWAInstalled(): boolean {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  return isStandalone || isIOSStandalone;
}

// Get service worker status
export async function getServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, registered: false, active: false };
  }

  const registration = await navigator.serviceWorker.getRegistration();
  
  return {
    supported: true,
    registered: !!registration,
    active: !!registration?.active,
    installing: !!registration?.installing,
    waiting: !!registration?.waiting,
    scope: registration?.scope || null
  };
}

export default {
  registerServiceWorker,
  unregisterServiceWorker,
  clearServiceWorkerCache,
  requestBackgroundSync,
  isPWAInstalled,
  getServiceWorkerStatus
};