import React, { useState, useEffect } from 'react';
import { FaMobile, FaTablet, FaDesktop, FaWifi, FaBatteryFull, FaBell, FaDownload, FaCog } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  isOnline: boolean;
  batteryLevel?: number;
  isPWA: boolean;
  isInstallable: boolean;
}

const MobileOptimization: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Detect device information
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width < 768) {
        type = 'mobile';
      } else if (width < 1024) {
        type = 'tablet';
      }

      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true;

      setDeviceInfo({
        type,
        screenWidth: width,
        screenHeight: height,
        userAgent,
        isOnline: navigator.onLine,
        isPWA,
        isInstallable: false
      });
    };

    // Check if app is already installed
    const checkInstallation = () => {
      const isInstalled = localStorage.getItem('pwa-installed') === 'true';
      setIsInstalled(isInstalled);
    };

    // Request notification permission
    const checkNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        setNotificationPermission(permission);
      }
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    detectDevice();
    checkInstallation();
    checkNotificationPermission();
    registerServiceWorker();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (deviceInfo) {
        setDeviceInfo(prev => prev ? { ...prev, isInstallable: true } : null);
      }
    });

    // Listen for online/offline changes
    const handleOnline = () => {
      if (deviceInfo) {
        setDeviceInfo(prev => prev ? { ...prev, isOnline: true } : null);
      }
    };

    const handleOffline = () => {
      if (deviceInfo) {
        setDeviceInfo(prev => prev ? { ...prev, isOnline: false } : null);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for resize events
    window.addEventListener('resize', detectDevice);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('resize', detectDevice);
    };
  }, [deviceInfo]);

  const handleInstall = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
        setInstallPrompt(null);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('ShopifyGenie Test', {
        body: 'This is a test notification from ShopifyGenie',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <FaMobile className="text-primary" />;
      case 'tablet': return <FaTablet className="text-info" />;
      case 'desktop': return <FaDesktop className="text-success" />;
      default: return <FaDesktop className="text-secondary" />;
    }
  };

  const getConnectionStatus = (isOnline: boolean) => {
    return isOnline ? (
      <span className="badge bg-success">
        <FaWifi className="me-1" />
        Online
      </span>
    ) : (
      <span className="badge bg-danger">
        <FaWifi className="me-1" />
        Offline
      </span>
    );
  };

  if (!deviceInfo) {
    return (
      <AnimatedCard>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Mobile & PWA Features</h5>
        {getDeviceIcon(deviceInfo.type)}
      </div>
      <div className="card-body">
        {/* Device Information */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Device Information</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-2">
                  {getDeviceIcon(deviceInfo.type)}
                  <span className="ms-2 fw-semibold text-capitalize">{deviceInfo.type}</span>
                </div>
                <div className="small text-muted">
                  Screen: {deviceInfo.screenWidth} × {deviceInfo.screenHeight}px
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-2">
                  {getConnectionStatus(deviceInfo.isOnline)}
                </div>
                <div className="small text-muted">
                  {deviceInfo.isPWA ? 'Running as PWA' : 'Running in browser'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Installation */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Progressive Web App</h6>
          {isInstalled ? (
            <div className="alert alert-success">
              <FaDownload className="me-2" />
              <strong>Installed!</strong> ShopifyGenie is installed as a PWA on your device.
            </div>
          ) : deviceInfo.isInstallable ? (
            <div className="alert alert-info">
              <FaDownload className="me-2" />
              <strong>Install Available!</strong> You can install ShopifyGenie as a PWA for a better experience.
              <div className="mt-2">
                <button className="btn btn-primary btn-sm" onClick={handleInstall}>
                  <FaDownload className="me-1" />
                  Install App
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary">
              <FaCog className="me-2" />
              PWA installation not available on this device/browser.
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Push Notifications</h6>
          <div className="d-flex align-items-center gap-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center">
                <FaBell className="me-2" />
                <span>Notification Permission: </span>
                <span className={`badge ms-2 ${
                  notificationPermission === 'granted' ? 'bg-success' :
                  notificationPermission === 'denied' ? 'bg-danger' : 'bg-warning'
                }`}>
                  {notificationPermission}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2">
              {notificationPermission !== 'granted' && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={requestNotificationPermission}
                >
                  Request Permission
                </button>
              )}
              {notificationPermission === 'granted' && (
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={sendTestNotification}
                >
                  Test Notification
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Optimization Tips */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Mobile Optimization</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 border rounded">
                <h6 className="small fw-bold">Responsive Design</h6>
                <p className="small text-muted mb-0">
                  The dashboard automatically adapts to your screen size for optimal viewing.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 border rounded">
                <h6 className="small fw-bold">Touch-Friendly</h6>
                <p className="small text-muted mb-0">
                  All buttons and controls are optimized for touch interaction.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 border rounded">
                <h6 className="small fw-bold">Offline Support</h6>
                <p className="small text-muted mb-0">
                  Basic functionality works even when you're offline.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 border rounded">
                <h6 className="small fw-bold">Fast Loading</h6>
                <p className="small text-muted mb-0">
                  Optimized for mobile networks with efficient caching.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PWA Benefits */}
        <div>
          <h6 className="fw-bold mb-3">PWA Benefits</h6>
          <ul className="list-unstyled">
            <li className="mb-2">
              <FaMobile className="text-primary me-2" />
              <strong>App-like Experience:</strong> Full-screen, immersive interface
            </li>
            <li className="mb-2">
              <FaDownload className="text-success me-2" />
              <strong>Installable:</strong> Add to home screen like a native app
            </li>
            <li className="mb-2">
              <FaWifi className="text-info me-2" />
              <strong>Offline Capable:</strong> Works without internet connection
            </li>
            <li className="mb-2">
              <FaBell className="text-warning me-2" />
              <strong>Push Notifications:</strong> Stay updated with real-time alerts
            </li>
            <li className="mb-2">
              <FaCog className="text-secondary me-2" />
              <strong>Auto Updates:</strong> Always get the latest features
            </li>
          </ul>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MobileOptimization;
