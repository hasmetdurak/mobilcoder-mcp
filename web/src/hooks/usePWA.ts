import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: 'accepted' | 'dismissed';
  readonly outcome: 'accepted' | 'dismissed';
}

interface PWAInstallPrompt {
  prompt: () => Promise<'accepted' | 'dismissed'>;
  isSupported: boolean;
}

export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  // Check if app is installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === false && 'standalone' in window.navigator;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      setIsInstalled(isInstalled);
      
      // Check for app installation banner
      const installBanner = document.getElementById('pwa-install-banner');
      if (installBanner) {
        installBanner.style.display = isInstalled ? 'none' : 'block';
      }
    };

    checkInstalled();
    
    // Listen for app installed events
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    });

    // Check if previously installed
    const previouslyInstalled = localStorage.getItem('pwa-installed') === 'true';
    if (previouslyInstalled) {
      setIsInstalled(true);
    }
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt({
        prompt: () => {
          event.prompt();
          return event.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              setIsInstalled(true);
              localStorage.setItem('pwa-installed', 'true');
            }
            return choiceResult.outcome;
          });
        },
        isSupported: true
      });
      
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Hide offline banner when online
      const offlineBanner = document.getElementById('offline-banner');
      if (offlineBanner) {
        offlineBanner.style.display = 'none';
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      // Show offline banner
      const offlineBanner = document.getElementById('offline-banner');
      if (offlineBanner) {
        offlineBanner.style.display = 'block';
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for app updates
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          
          if (registration.waiting) {
            setShowUpdateBanner(true);
          }
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            setShowUpdateBanner(true);
          });
          
          registration.addEventListener('controllerchange', () => {
            // New service worker is active, hide update banner
            setShowUpdateBanner(false);
            
            // Show notification about update
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('App Updated', {
                body: 'MobileCoder MCP has been updated to the latest version.',
                icon: '/icons/icon-96x96.png',
                badge: '/icons/icon-72x72.png'
              });
            }
          });
        }
      } catch (error) {
        console.error('PWA update check failed:', error);
      }
    };

    // Check for updates every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (deferredPrompt && deferredPrompt.isSupported) {
      try {
        const result = await deferredPrompt.prompt();
        if (result === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('pwa-installed', 'true');
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
      }
    }
  }, [deferredPrompt]);

  // Refresh page for update
  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Notification permission request failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Show update notification
  const showUpdateNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version of MobileCoder MCP is available. Click to update.',
        icon: '/icons/icon-96x96.png',
        badge: '/icons/icon-72x72.png',
        requireInteraction: true,
        actions: [
          {
            action: 'update',
            title: 'Update Now'
          },
          {
            action: 'dismiss',
            title: 'Later'
          }
        ]
      });
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOffline,
    showUpdateBanner,
    installPWA,
    refreshPage,
    requestNotificationPermission,
    showUpdateNotification,
    deferredPrompt
  };
};