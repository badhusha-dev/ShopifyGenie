import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { apiRequest } from '../lib/queryClient';
import ThemeSettings from '../components/ThemeSettings';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  const { data: systemSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await fetch('/api/system/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();

      // Convert to settings object
      const settingsObj: Record<string, string> = {};
      data.forEach((setting: Setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);

      return data;
    }
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/system/audit-logs');
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Record<string, string>) => {
      const response = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: () => {
      console.error('Failed to update settings');
    }
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <i className="fas fa-plus text-success"></i>;
      case 'update': return <i className="fas fa-edit text-primary"></i>;
      case 'delete': return <i className="fas fa-trash text-danger"></i>;
      case 'view': return <i className="fas fa-eye text-muted"></i>;
      default: return <i className="fas fa-circle text-muted"></i>;
    }
  };

  const getActionBadge = (action: string) => {
    const badgeClasses = {
      create: 'bg-success',
      update: 'bg-primary',
      delete: 'bg-danger',
      view: 'bg-info'
    };
    return <span className={`badge ${badgeClasses[action.toLowerCase() as keyof typeof badgeClasses] || 'bg-secondary'}`}>
      {action}
    </span>;
  };

  if (settingsLoading && logsLoading) {
    return (
      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-12">
            <div className="placeholder-glow">
              <span className="placeholder col-4 mb-3"></span>
              <span className="placeholder w-100" style={{height: '400px'}}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate-fade-in-up">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                <i className="fas fa-cogs me-2 text-primary"></i>
                System Settings
              </h1>
              <p className="text-muted mb-0">Configure system preferences and monitor activity</p>
            </div>
            <button
              className="btn btn-shopify d-flex align-items-center"
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs nav-fill" id="settingsTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
                type="button"
              >
                <i className="fas fa-cog me-2"></i>
                General Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
                type="button"
              >
                <i className="fas fa-bell me-2"></i>
                Notifications
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                type="button"
              >
                <i className="fas fa-shield-alt me-2"></i>
                Security
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'shopify' ? 'active' : ''}`}
                onClick={() => setActiveTab('shopify')}
                type="button"
              >
                <i className="fab fa-shopify me-2"></i>
                Shopify Integration
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'theme' ? 'active' : ''}`}
                onClick={() => setActiveTab('theme')}
                type="button"
              >
                <i className="fas fa-palette me-2"></i>
                Theme Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
                type="button"
              >
                <i className="fas fa-history me-2"></i>
                Audit Logs ({auditLogs.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-store me-2 text-primary"></i>
                  Store Configuration
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="storeName" className="form-label fw-semibold">Store Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="storeName"
                      value={settings.storeName || ''}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      placeholder="Enter your store name"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="storeDescription" className="form-label fw-semibold">Store Description</label>
                    <textarea
                      className="form-control"
                      id="storeDescription"
                      rows={3}
                      value={settings.storeDescription || ''}
                      onChange={(e) => handleSettingChange('storeDescription', e.target.value)}
                      placeholder="Describe your store"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="currency" className="form-label fw-semibold">Default Currency</label>
                    <select
                      className="form-select"
                      id="currency"
                      value={settings.currency || 'USD'}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="timezone" className="form-label fw-semibold">Timezone</label>
                    <select
                      className="form-select"
                      id="timezone"
                      value={settings.timezone || 'UTC'}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-paint-brush me-2 text-success"></i>
                  Display Preferences
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="darkMode"
                        checked={settings.darkMode === 'true'}
                        onChange={(e) => handleSettingChange('darkMode', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="darkMode">
                        <i className="fas fa-moon me-2"></i>
                        Dark Mode
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="compactView"
                        checked={settings.compactView === 'true'}
                        onChange={(e) => handleSettingChange('compactView', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="compactView">
                        <i className="fas fa-compress-alt me-2"></i>
                        Compact View
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="itemsPerPage" className="form-label fw-semibold">Items Per Page</label>
                    <select
                      className="form-select"
                      id="itemsPerPage"
                      value={settings.itemsPerPage || '25'}
                      onChange={(e) => handleSettingChange('itemsPerPage', e.target.value)}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-envelope me-2 text-primary"></i>
                  Email Notifications
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="orderEmails"
                        checked={settings.orderEmails === 'true'}
                        onChange={(e) => handleSettingChange('orderEmails', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="orderEmails">
                        Order Confirmations
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="stockAlerts"
                        checked={settings.stockAlerts === 'true'}
                        onChange={(e) => handleSettingChange('stockAlerts', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="stockAlerts">
                        Low Stock Alerts
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="marketingEmails"
                        checked={settings.marketingEmails === 'true'}
                        onChange={(e) => handleSettingChange('marketingEmails', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="marketingEmails">
                        Marketing Updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-mobile-alt me-2 text-success"></i>
                  Push Notifications
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pushOrders"
                        checked={settings.pushOrders === 'true'}
                        onChange={(e) => handleSettingChange('pushOrders', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="pushOrders">
                        New Orders
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pushReturns"
                        checked={settings.pushReturns === 'true'}
                        onChange={(e) => handleSettingChange('pushReturns', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="pushReturns">
                        Return Requests
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="pushSystemAlerts"
                        checked={settings.pushSystemAlerts === 'true'}
                        onChange={(e) => handleSettingChange('pushSystemAlerts', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="pushSystemAlerts">
                        System Alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-lock me-2 text-warning"></i>
                  Authentication Settings
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth === 'true'}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="twoFactorAuth">
                        Require Two-Factor Authentication
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="sessionTimeout" className="form-label fw-semibold">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="sessionTimeout"
                      min="15"
                      max="480"
                      value={settings.sessionTimeout || '60'}
                      onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="passwordExpiry" className="form-label fw-semibold">Password Expiry (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="passwordExpiry"
                      min="30"
                      max="365"
                      value={settings.passwordExpiry || '90'}
                      onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-shield-alt me-2 text-danger"></i>
                  Security Policies
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ipWhitelist"
                        checked={settings.ipWhitelist === 'true'}
                        onChange={(e) => handleSettingChange('ipWhitelist', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="ipWhitelist">
                        IP Address Whitelist
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="auditLogging"
                        checked={settings.auditLogging === 'true'}
                        onChange={(e) => handleSettingChange('auditLogging', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="auditLogging">
                        Enhanced Audit Logging
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="maxLoginAttempts" className="form-label fw-semibold">Max Login Attempts</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxLoginAttempts"
                      min="3"
                      max="10"
                      value={settings.maxLoginAttempts || '5'}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopify Integration Tab */}
        {activeTab === 'shopify' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fab fa-shopify me-2 text-primary"></i>
                  Shopify Store Credentials
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="shopifyDomain" className="form-label fw-semibold">Shop Domain</label>
                    <input
                      type="text"
                      className="form-control"
                      id="shopifyDomain"
                      value={settings.shopifyDomain || ''}
                      onChange={(e) => handleSettingChange('shopifyDomain', e.target.value)}
                      placeholder="your-store.myshopify.com"
                    />
                    <div className="form-text">Enter your Shopify store domain (e.g., your-store.myshopify.com)</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="shopifyApiKey" className="form-label fw-semibold">API Key</label>
                    <input
                      type="password"
                      className="form-control"
                      id="shopifyApiKey"
                      value={settings.shopifyApiKey || ''}
                      onChange={(e) => handleSettingChange('shopifyApiKey', e.target.value)}
                      placeholder="Enter your Shopify API key"
                    />
                    <div className="form-text">Your Shopify app's API key</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="shopifyApiSecret" className="form-label fw-semibold">API Secret</label>
                    <input
                      type="password"
                      className="form-control"
                      id="shopifyApiSecret"
                      value={settings.shopifyApiSecret || ''}
                      onChange={(e) => handleSettingChange('shopifyApiSecret', e.target.value)}
                      placeholder="Enter your Shopify API secret"
                    />
                    <div className="form-text">Your Shopify app's API secret key</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="shopifyAccessToken" className="form-label fw-semibold">Access Token</label>
                    <input
                      type="password"
                      className="form-control"
                      id="shopifyAccessToken"
                      value={settings.shopifyAccessToken || ''}
                      onChange={(e) => handleSettingChange('shopifyAccessToken', e.target.value)}
                      placeholder="Enter your Shopify access token"
                    />
                    <div className="form-text">Private app access token for API authentication</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-cog me-2 text-success"></i>
                  Integration Settings
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="shopifySyncEnabled"
                        checked={settings.shopifySyncEnabled === 'true'}
                        onChange={(e) => handleSettingChange('shopifySyncEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="shopifySyncEnabled">
                        <i className="fas fa-sync me-2"></i>
                        Enable Shopify Sync
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoSyncProducts"
                        checked={settings.autoSyncProducts === 'true'}
                        onChange={(e) => handleSettingChange('autoSyncProducts', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="autoSyncProducts">
                        <i className="fas fa-boxes me-2"></i>
                        Auto-sync Products
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoSyncOrders"
                        checked={settings.autoSyncOrders === 'true'}
                        onChange={(e) => handleSettingChange('autoSyncOrders', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="autoSyncOrders">
                        <i className="fas fa-shopping-cart me-2"></i>
                        Auto-sync Orders
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoSyncCustomers"
                        checked={settings.autoSyncCustomers === 'true'}
                        onChange={(e) => handleSettingChange('autoSyncCustomers', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="autoSyncCustomers">
                        <i className="fas fa-users me-2"></i>
                        Auto-sync Customers
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="syncInterval" className="form-label fw-semibold">Sync Interval (minutes)</label>
                    <select
                      className="form-select"
                      id="syncInterval"
                      value={settings.syncInterval || '30'}
                      onChange={(e) => handleSettingChange('syncInterval', e.target.value)}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-info-circle me-2 text-info"></i>
                  Connection Status & Test
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="me-3">
                        <i className="fas fa-circle text-success fs-4"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Connection Status</h6>
                        <p className="text-muted mb-0">Connected to Shopify</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="me-3">
                        <i className="fas fa-clock text-warning fs-4"></i>
                      </div>
                      <div>
                        <h6 className="mb-1">Last Sync</h6>
                        <p className="text-muted mb-0">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary d-flex align-items-center"
                        onClick={() => {
                          // Test connection logic
                          console.log('Testing Shopify connection...');
                        }}
                      >
                        <i className="fas fa-plug me-2"></i>
                        Test Connection
                      </button>
                      <button
                        className="btn btn-outline-success d-flex align-items-center"
                        onClick={() => {
                          // Manual sync logic
                          console.log('Starting manual sync...');
                        }}
                      >
                        <i className="fas fa-sync me-2"></i>
                        Manual Sync
                      </button>
                      <button
                        className="btn btn-outline-warning d-flex align-items-center"
                        onClick={() => {
                          // Clear cache logic
                          console.log('Clearing sync cache...');
                        }}
                      >
                        <i className="fas fa-trash me-2"></i>
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Theme Settings Tab */}
        {activeTab === 'theme' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-12">
              <ThemeSettings />
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="row animate-slide-in">
            <div className="col-12">
              <div className="modern-card">
                <div className="table-responsive">
                  <table className="table modern-table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Timestamp</th>
                        <th>Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log: AuditLog) => (
                        <tr key={log.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {getActionIcon(log.action)}
                              <span className="ms-2 fw-semibold">{log.action}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center me-2"
                                   style={{width: '32px', height: '32px'}}>
                                <i className="fas fa-user text-primary"></i>
                              </div>
                              {log.user}
                            </div>
                          </td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>{log.details}</td>
                          <td>{getActionBadge(log.action)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;