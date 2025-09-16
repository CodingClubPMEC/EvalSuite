import { useState, useEffect } from 'react';

/**
 * Custom hook for PWA functionality
 */
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline changes
    const handleOnline = () => {
      console.log('[PWA] App is online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[PWA] App is offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkIfInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Install the PWA
  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA] User choice:', outcome);
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Error installing app:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA
  };
};

/**
 * Register service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('[PWA] Registering service worker');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        console.log('[PWA] New service worker available');
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New content available, refresh needed');
            // You can show a notification to the user here
            if (window.confirm('New version available! Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      });

      console.log('[PWA] Service worker registered successfully');
      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return null;
    }
  } else {
    console.log('[PWA] Service workers not supported');
    return null;
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[PWA] Service worker unregistered');
      return true;
    } catch (error) {
      console.error('[PWA] Error unregistering service worker:', error);
      return false;
    }
  }
  return false;
};

/**
 * Cache evaluation data for offline use
 */
export const cacheEvaluationData = async (data) => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('sih-jury-evaluations');
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=86400' // 24 hours
        }
      });
      
      await cache.put('/api/evaluations/cache', response);
      console.log('[PWA] Evaluation data cached');
      return true;
    }
  } catch (error) {
    console.error('[PWA] Error caching evaluation data:', error);
  }
  return false;
};

/**
 * Get cached evaluation data
 */
export const getCachedEvaluationData = async () => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('sih-jury-evaluations');
      const response = await cache.match('/api/evaluations/cache');
      
      if (response) {
        const data = await response.json();
        console.log('[PWA] Retrieved cached evaluation data');
        return data;
      }
    }
  } catch (error) {
    console.error('[PWA] Error retrieving cached data:', error);
  }
  return null;
};