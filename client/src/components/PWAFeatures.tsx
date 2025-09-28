import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Upload,
  Battery,
  BatteryLow,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  RotateCcw,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  Heart,
  Share,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  RefreshCw,
  Zap,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Play
} from 'lucide-react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  batteryLevel?: number;
  isLowPowerMode: boolean;
  isMuted: boolean;
  isDarkMode: boolean;
  isFullscreen: boolean;
  lastSync?: Date;
  cacheSize: number;
  storageUsed: number;
  storageQuota: number;
}

interface PWAFeaturesProps {
  className?: string;
}

const PWAFeatures: React.FC<PWAFeaturesProps> = ({ className = '' }) => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    batteryLevel: 85,
    isLowPowerMode: false,
    isMuted: false,
    isDarkMode: false,
    isFullscreen: false,
    cacheSize: 12.5,
    storageUsed: 45.2,
    storageQuota: 100
  });

  const [activeTab, setActiveTab] = useState<'status' | 'offline' | 'sync' | 'settings'>('status');
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check PWA installation status
    checkInstallStatus();
    
    // Listen for online/offline events
    const handleOnline = () => setPwaStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check battery status if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setPwaStatus(prev => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          isLowPowerMode: battery.charging === false && battery.level < 0.2
        }));
      });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkInstallStatus = () => {
    // Check if app is installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInApp = (window.navigator as any).standalone === true;
    setPwaStatus(prev => ({ ...prev, isInstalled: isStandalone || isInApp }));
    
    // Show install prompt if not installed
    if (!isStandalone && !isInApp) {
      setShowInstallPrompt(true);
    }
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    
    // Simulate installation process
    setTimeout(() => {
      setPwaStatus(prev => ({ ...prev, isInstalled: true }));
      setShowInstallPrompt(false);
      setIsInstalling(false);
    }, 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setPwaStatus(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setPwaStatus(prev => ({ ...prev, isFullscreen: false }));
    }
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    setPwaStatus(prev => ({ ...prev, cacheSize: 0 }));
  };

  const syncData = () => {
    setPwaStatus(prev => ({ ...prev, lastSync: new Date() }));
  };

  const getBatteryIcon = (level: number) => {
    if (level > 75) return Battery;
    if (level > 25) return Battery;
    return BatteryLow;
  };

  const getBatteryColor = (level: number) => {
    if (level > 75) return 'success';
    if (level > 25) return 'warning';
    return 'danger';
  };

  const offlineActions = [
    { id: '1', name: 'View Cached Products', description: 'Browse products saved offline', icon: Package, available: true },
    { id: '2', name: 'View Customer Data', description: 'Access cached customer information', icon: Users, available: true },
    { id: '3', name: 'Create Order Draft', description: 'Draft new orders for later sync', icon: ShoppingCart, available: true },
    { id: '4', name: 'View Reports', description: 'Access cached reports and analytics', icon: BarChart3, available: false },
    { id: '5', name: 'Update Inventory', description: 'Modify inventory levels offline', icon: Package, available: true }
  ];

  const syncHistory = [
    { id: '1', type: 'success', action: 'Products synchronized', time: '2 minutes ago', records: 156 },
    { id: '2', type: 'success', action: 'Customer data updated', time: '15 minutes ago', records: 89 },
    { id: '3', type: 'warning', action: 'Partial sync completed', time: '1 hour ago', records: 234 },
    { id: '4', type: 'success', action: 'Orders synchronized', time: '2 hours ago', records: 45 },
    { id: '5', type: 'error', action: 'Sync failed - network error', time: '3 hours ago', records: 0 }
  ];

  return (
    <div className={`pwa-features ${className}`}>
      {/* Install Prompt */}
      {showInstallPrompt && !pwaStatus.isInstalled && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="modern-card p-4 border-warning">
              <div className="d-flex align-items-center">
                <div className="install-icon me-3">
                  <Smartphone size={32} className="text-warning" />
                </div>
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">Install ShopifyGenie App</h6>
                  <p className="text-muted mb-2 small">
                    Install the app for a better mobile experience with offline access
                  </p>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-warning btn-sm"
                      onClick={handleInstall}
                      disabled={isInstalling}
                    >
                      {isInstalling ? (
                        <>
                          <RefreshCw size={16} className="me-2 spinning" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download size={16} className="me-2" />
                          Install App
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowInstallPrompt(false)}
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">Progressive Web App</h5>
                <p className="text-muted mb-0">
                  Mobile-optimized experience with offline capabilities
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="status-indicators">
                  <div className="d-flex align-items-center gap-2">
                    {pwaStatus.isOnline ? (
                      <Wifi size={20} className="text-success" />
                    ) : (
                      <WifiOff size={20} className="text-danger" />
                    )}
                    <span className="small fw-semibold">
                      {pwaStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <button className="btn btn-outline-primary">
                  <Settings size={16} className="me-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                {pwaStatus.isInstalled ? (
                  <CheckCircle size={24} className="text-success" />
                ) : (
                  <Smartphone size={24} className="text-warning" />
                )}
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">
                {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
              </h3>
              <p className="kpi-title">App Status</p>
              <p className="kpi-subtext text-muted small">
                {pwaStatus.isInstalled ? 'PWA installed' : 'Install for better experience'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                {React.createElement(getBatteryIcon(pwaStatus.batteryLevel || 0), { size: 24, className: `text-${getBatteryColor(pwaStatus.batteryLevel || 0)}` })}
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{pwaStatus.batteryLevel}%</h3>
              <p className="kpi-title">Battery Level</p>
              <p className="kpi-subtext text-muted small">
                {pwaStatus.isLowPowerMode ? 'Low power mode' : 'Normal operation'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Shield size={24} className="text-info" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{pwaStatus.cacheSize}MB</h3>
              <p className="kpi-title">Cache Size</p>
              <p className="kpi-subtext text-muted small">
                Offline data storage
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Clock size={24} className="text-primary" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">
                {pwaStatus.lastSync ? '2 min ago' : 'Never'}
              </h3>
              <p className="kpi-title">Last Sync</p>
              <p className="kpi-subtext text-muted small">
                Data synchronization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <ul className="nav nav-tabs border-0" role="tablist">
              {[
                { id: 'status', label: 'Status', icon: Info },
                { id: 'offline', label: 'Offline Mode', icon: WifiOff },
                { id: 'sync', label: 'Sync & Storage', icon: RefreshCw },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <li key={tab.id} className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    type="button"
                  >
                    <tab.icon size={16} className="me-2" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3">App Status Overview</h6>
              
              <div className="status-grid">
                <div className="status-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center">
                    <Smartphone size={20} className="text-primary me-3" />
                    <div>
                      <div className="fw-semibold">Installation</div>
                      <div className="text-muted small">App installation status</div>
                    </div>
                  </div>
                  <span className={`badge bg-${pwaStatus.isInstalled ? 'success' : 'warning'}-subtle text-${pwaStatus.isInstalled ? 'success' : 'warning'}`}>
                    {pwaStatus.isInstalled ? 'Installed' : 'Not Installed'}
                  </span>
                </div>
                
                <div className="status-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center">
                    {pwaStatus.isOnline ? (
                      <Wifi size={20} className="text-success me-3" />
                    ) : (
                      <WifiOff size={20} className="text-danger me-3" />
                    )}
                    <div>
                      <div className="fw-semibold">Connection</div>
                      <div className="text-muted small">Network connectivity</div>
                    </div>
                  </div>
                  <span className={`badge bg-${pwaStatus.isOnline ? 'success' : 'danger'}-subtle text-${pwaStatus.isOnline ? 'success' : 'danger'}`}>
                    {pwaStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="status-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center">
                    {React.createElement(getBatteryIcon(pwaStatus.batteryLevel || 0), { size: 20, className: `text-${getBatteryColor(pwaStatus.batteryLevel || 0)} me-3` })}
                    <div>
                      <div className="fw-semibold">Battery</div>
                      <div className="text-muted small">Device battery level</div>
                    </div>
                  </div>
                  <span className="fw-semibold">{pwaStatus.batteryLevel}%</span>
                </div>
                
                <div className="status-item d-flex justify-content-between align-items-center p-3 border rounded mb-3">
                  <div className="d-flex align-items-center">
                    <Shield size={20} className="text-info me-3" />
                    <div>
                      <div className="fw-semibold">Storage</div>
                      <div className="text-muted small">Used storage space</div>
                    </div>
                  </div>
                  <span className="fw-semibold">{pwaStatus.storageUsed}MB / {pwaStatus.storageQuota}MB</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3">Quick Actions</h6>
              
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <Download size={16} className="me-2" />
                  Install App
                </button>
                <button className="btn btn-outline-success">
                  <RefreshCw size={16} className="me-2" />
                  Sync Data
                </button>
                <button className="btn btn-outline-info">
                  <Shield size={16} className="me-2" />
                  Clear Cache
                </button>
                <button className="btn btn-outline-secondary">
                  <Settings size={16} className="me-2" />
                  App Settings
                </button>
              </div>
              
              <div className="mt-4">
                <h6 className="fw-bold mb-3">Performance</h6>
                <div className="progress mb-2">
                  <div className="progress-bar bg-success" style={{ width: '85%' }}></div>
                </div>
                <div className="small text-muted">App Performance: Excellent</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode Tab */}
      {activeTab === 'offline' && (
        <div className="row">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex align-items-center mb-4">
                <WifiOff size={24} className="text-warning me-3" />
                <div>
                  <h6 className="fw-bold mb-1">Offline Mode</h6>
                  <p className="text-muted mb-0">Access essential features without internet connection</p>
                </div>
              </div>
              
              <div className="row g-3">
                {offlineActions.map(action => (
                  <div key={action.id} className="col-lg-4 col-md-6">
                    <div className={`card h-100 ${action.available ? 'border-success' : 'border-secondary'}`}>
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <div className={`action-icon me-3 ${action.available ? 'text-success' : 'text-muted'}`}>
                            <action.icon size={24} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="card-title fw-bold">{action.name}</h6>
                            <p className="card-text text-muted small">{action.description}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <span className={`badge ${action.available ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                            {action.available ? 'Available' : 'Coming Soon'}
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            disabled={!action.available}
                          >
                            <Eye size={14} className="me-1" />
                            Access
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync & Storage Tab */}
      {activeTab === 'sync' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Sync History</h6>
                <button className="btn btn-sm btn-primary" onClick={syncData}>
                  <RefreshCw size={16} className="me-2" />
                  Sync Now
                </button>
              </div>
              
              <div className="sync-history">
                {syncHistory.map(sync => (
                  <div key={sync.id} className="sync-item d-flex align-items-center p-3 border rounded mb-2">
                    <div className="sync-icon me-3">
                      {sync.type === 'success' && <CheckCircle size={20} className="text-success" />}
                      {sync.type === 'warning' && <AlertTriangle size={20} className="text-warning" />}
                      {sync.type === 'error' && <AlertTriangle size={20} className="text-danger" />}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{sync.action}</div>
                      <div className="text-muted small">{sync.time}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold">{sync.records} records</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3">Storage Usage</h6>
              
              <div className="storage-breakdown">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">App Data</span>
                  <span className="fw-semibold">25.4 MB</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Cache</span>
                  <span className="fw-semibold">12.5 MB</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Images</span>
                  <span className="fw-semibold">7.3 MB</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted small">Total</span>
                  <span className="fw-semibold">{pwaStatus.storageUsed} MB</span>
                </div>
                
                <div className="progress mb-3">
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${(pwaStatus.storageUsed / pwaStatus.storageQuota) * 100}%` }}
                  ></div>
                </div>
                
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary flex-fill" onClick={clearCache}>
                    Clear Cache
                  </button>
                  <button className="btn btn-sm btn-outline-secondary flex-fill">
                    Manage Storage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="row">
          <div className="col-12">
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3">PWA Settings</h6>
              
              <div className="settings-grid">
                <div className="setting-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-semibold">Auto Sync</div>
                      <div className="text-muted small">Automatically sync data when online</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="autoSync" defaultChecked />
                      <label className="form-check-label" htmlFor="autoSync"></label>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-semibold">Low Data Mode</div>
                      <div className="text-muted small">Reduce data usage for slower connections</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="lowData" />
                      <label className="form-check-label" htmlFor="lowData"></label>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-semibold">Background Sync</div>
                      <div className="text-muted small">Sync data in background when possible</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="backgroundSync" defaultChecked />
                      <label className="form-check-label" htmlFor="backgroundSync"></label>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-semibold">Push Notifications</div>
                      <div className="text-muted small">Receive notifications for important updates</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="pushNotifications" defaultChecked />
                      <label className="form-check-label" htmlFor="pushNotifications"></label>
                    </div>
                  </div>
                </div>
                
                <div className="setting-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-semibold">Offline Mode</div>
                      <div className="text-muted small">Enable offline functionality</div>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="offlineMode" defaultChecked />
                      <label className="form-check-label" htmlFor="offlineMode"></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAFeatures;
