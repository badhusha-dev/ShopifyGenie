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
    queryKey: ['/system/settings'],
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
    queryKey: ['/system/audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/system/audit-logs');
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/system/health'],
    queryFn: async () => {
      const response = await fetch('/api/system/health');
      if (!response.ok) throw new Error('Failed to fetch system health');
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
      queryClient.invalidateQueries({ queryKey: ['/system/settings'] });
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

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/system/backup', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/system/audit-logs'] });
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (action: string) => {
      const response = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to perform maintenance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/system/health'] });
      queryClient.invalidateQueries({ queryKey: ['/system/audit-logs'] });
    },
  });

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
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('maintenance')}
                type="button"
              >
                <i className="fas fa-tools me-2"></i>
                System Maintenance
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'integrations' ? 'active' : ''}`}
                onClick={() => setActiveTab('integrations')}
                type="button"
              >
                <i className="fas fa-plug me-2"></i>
                Integrations
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'api' ? 'active' : ''}`}
                onClick={() => setActiveTab('api')}
                type="button"
              >
                <i className="fas fa-code me-2"></i>
                API Management
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
                type="button"
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Performance
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => setActiveTab('backup')}
                type="button"
              >
                <i className="fas fa-cloud me-2"></i>
                Backup Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
                type="button"
              >
                <i className="fas fa-user me-2"></i>
                User Profile
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
                type="button"
              >
                <i className="fas fa-envelope me-2"></i>
                Email Settings
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
                type="button"
              >
                <i className="fas fa-lock me-2"></i>
                Privacy & Data
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'advanced' ? 'active' : ''}`}
                onClick={() => setActiveTab('advanced')}
                type="button"
              >
                <i className="fas fa-cogs me-2"></i>
                Advanced
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === 'customization' ? 'active' : ''}`}
                onClick={() => setActiveTab('customization')}
                type="button"
              >
                <i className="fas fa-paint-brush me-2"></i>
                Customization
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

        {/* System Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-tools me-2 text-primary"></i>
                  System Health
                </h5>
                {systemHealth && (
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                        <div>
                          <h6 className="mb-1">Overall Status</h6>
                          <p className="text-muted mb-0">System Health</p>
                        </div>
                        <span className={`badge ${systemHealth.status === 'healthy' ? 'bg-success' : 'bg-warning'}`}>
                          {systemHealth.status}
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                        <div>
                          <h6 className="mb-1">Uptime</h6>
                          <p className="text-muted mb-0">System Availability</p>
                        </div>
                        <span className="badge bg-info">{systemHealth.uptime}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <h6 className="mb-2">Component Status</h6>
                      {Object.entries(systemHealth.components || {}).map(([component, status]: [string, any]) => (
                        <div key={component} className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-capitalize">{component}</span>
                          <span className={`badge ${status.status === 'healthy' ? 'bg-success' : 'bg-warning'}`}>
                            {status.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-database me-2 text-success"></i>
                  Maintenance Actions
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <button
                      className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                      onClick={() => maintenanceMutation.mutate('clear_cache')}
                      disabled={maintenanceMutation.isPending}
                    >
                      <i className="fas fa-broom me-2"></i>
                      Clear Cache
                    </button>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-center"
                      onClick={() => maintenanceMutation.mutate('optimize_database')}
                      disabled={maintenanceMutation.isPending}
                    >
                      <i className="fas fa-database me-2"></i>
                      Optimize Database
                    </button>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center"
                      onClick={() => maintenanceMutation.mutate('cleanup_logs')}
                      disabled={maintenanceMutation.isPending}
                    >
                      <i className="fas fa-file-alt me-2"></i>
                      Cleanup Logs
                    </button>
                  </div>
                  <div className="col-12">
                    <button
                      className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                      onClick={() => maintenanceMutation.mutate('update_indexes')}
                      disabled={maintenanceMutation.isPending}
                    >
                      <i className="fas fa-sync me-2"></i>
                      Update Indexes
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-download me-2 text-info"></i>
                  Backup Management
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <button
                      className="btn btn-success w-100 d-flex align-items-center justify-content-center"
                      onClick={() => createBackupMutation.mutate()}
                      disabled={createBackupMutation.isPending}
                    >
                      {createBackupMutation.isPending ? (
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <i className="fas fa-download me-2"></i>
                      )}
                      Create System Backup
                    </button>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded text-center">
                      <h6 className="mb-1">Last Backup</h6>
                      <p className="text-muted mb-0">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-plug me-2 text-primary"></i>
                  Third-Party Integrations
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <i className="fab fa-paypal text-primary me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1">PayPal</h6>
                          <small className="text-muted">Payment processing</small>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="paypalEnabled" />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <i className="fab fa-stripe text-info me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1">Stripe</h6>
                          <small className="text-muted">Payment gateway</small>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="stripeEnabled" />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-envelope text-warning me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1">Mailchimp</h6>
                          <small className="text-muted">Email marketing</small>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="mailchimpEnabled" />
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div className="d-flex align-items-center">
                        <i className="fab fa-google text-danger me-3 fs-4"></i>
                        <div>
                          <h6 className="mb-1">Google Analytics</h6>
                          <small className="text-muted">Website analytics</small>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="googleAnalyticsEnabled" />
                      </div>
                    </div>
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
                    <label htmlFor="webhookUrl" className="form-label fw-semibold">Webhook URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="webhookUrl"
                      value={settings.webhookUrl || ''}
                      onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                      placeholder="https://your-domain.com/webhook"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="apiRateLimit" className="form-label fw-semibold">API Rate Limit (requests/minute)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="apiRateLimit"
                      min="100"
                      max="10000"
                      value={settings.apiRateLimit || '1000'}
                      onChange={(e) => handleSettingChange('apiRateLimit', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoSyncEnabled"
                        checked={settings.autoSyncEnabled === 'true'}
                        onChange={(e) => handleSettingChange('autoSyncEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="autoSyncEnabled">
                        Enable Auto-Sync
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="syncFrequency" className="form-label fw-semibold">Sync Frequency</label>
                    <select
                      className="form-select"
                      id="syncFrequency"
                      value={settings.syncFrequency || 'hourly'}
                      onChange={(e) => handleSettingChange('syncFrequency', e.target.value)}
                    >
                      <option value="realtime">Real-time</option>
                      <option value="5min">Every 5 minutes</option>
                      <option value="15min">Every 15 minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Management Tab */}
        {activeTab === 'api' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-key me-2 text-warning"></i>
                  API Keys Management
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Production API Key</h6>
                        <small className="text-muted">pk_live_...abc123</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-copy"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Test API Key</h6>
                        <small className="text-muted">pk_test_...xyz789</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="fas fa-copy"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-warning">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100">
                      <i className="fas fa-plus me-2"></i>
                      Generate New API Key
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-shield-alt me-2 text-danger"></i>
                  API Security
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="apiAuthentication"
                        checked={settings.apiAuthentication === 'true'}
                        onChange={(e) => handleSettingChange('apiAuthentication', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="apiAuthentication">
                        Require API Authentication
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ipRestriction"
                        checked={settings.ipRestriction === 'true'}
                        onChange={(e) => handleSettingChange('ipRestriction', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="ipRestriction">
                        IP Address Restriction
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="allowedIPs" className="form-label fw-semibold">Allowed IP Addresses</label>
                    <textarea
                      className="form-control"
                      id="allowedIPs"
                      rows={3}
                      value={settings.allowedIPs || ''}
                      onChange={(e) => handleSettingChange('allowedIPs', e.target.value)}
                      placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
                    />
                    <div className="form-text">Enter one IP address or CIDR block per line</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="apiVersion" className="form-label fw-semibold">API Version</label>
                    <select
                      className="form-select"
                      id="apiVersion"
                      value={settings.apiVersion || 'v1'}
                      onChange={(e) => handleSettingChange('apiVersion', e.target.value)}
                    >
                      <option value="v1">v1 (Current)</option>
                      <option value="v2">v2 (Beta)</option>
                      <option value="v3">v3 (Alpha)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-tachometer-alt me-2 text-info"></i>
                  Performance Settings
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="cacheTimeout" className="form-label fw-semibold">Cache Timeout (seconds)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="cacheTimeout"
                      min="60"
                      max="3600"
                      value={settings.cacheTimeout || '300'}
                      onChange={(e) => handleSettingChange('cacheTimeout', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="maxConnections" className="form-label fw-semibold">Max Database Connections</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxConnections"
                      min="10"
                      max="100"
                      value={settings.maxConnections || '50'}
                      onChange={(e) => handleSettingChange('maxConnections', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="queryOptimization"
                        checked={settings.queryOptimization === 'true'}
                        onChange={(e) => handleSettingChange('queryOptimization', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="queryOptimization">
                        Enable Query Optimization
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="compressionEnabled"
                        checked={settings.compressionEnabled === 'true'}
                        onChange={(e) => handleSettingChange('compressionEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="compressionEnabled">
                        Enable Response Compression
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-chart-line me-2 text-success"></i>
                  Performance Metrics
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Average Response Time</h6>
                        <p className="text-muted mb-0">Last 24 hours</p>
                      </div>
                      <span className="badge bg-success">245ms</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Database Queries</h6>
                        <p className="text-muted mb-0">Per second</p>
                      </div>
                      <span className="badge bg-info">127</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">Memory Usage</h6>
                        <p className="text-muted mb-0">Current</p>
                      </div>
                      <span className="badge bg-warning">68%</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1">CPU Usage</h6>
                        <p className="text-muted mb-0">Current</p>
                      </div>
                      <span className="badge bg-primary">42%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Settings Tab */}
        {activeTab === 'backup' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-cloud me-2 text-primary"></i>
                  Backup Configuration
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="autoBackupEnabled"
                        checked={settings.autoBackupEnabled === 'true'}
                        onChange={(e) => handleSettingChange('autoBackupEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="autoBackupEnabled">
                        Enable Automatic Backups
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="backupFrequency" className="form-label fw-semibold">Backup Frequency</label>
                    <select
                      className="form-select"
                      id="backupFrequency"
                      value={settings.backupFrequency || 'daily'}
                      onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="backupRetention" className="form-label fw-semibold">Backup Retention (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="backupRetention"
                      min="7"
                      max="365"
                      value={settings.backupRetention || '30'}
                      onChange={(e) => handleSettingChange('backupRetention', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="backupEncryption"
                        checked={settings.backupEncryption === 'true'}
                        onChange={(e) => handleSettingChange('backupEncryption', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="backupEncryption">
                        Encrypt Backups
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-hdd me-2 text-success"></i>
                  Storage Settings
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="backupLocation" className="form-label fw-semibold">Backup Location</label>
                    <select
                      className="form-select"
                      id="backupLocation"
                      value={settings.backupLocation || 'local'}
                      onChange={(e) => handleSettingChange('backupLocation', e.target.value)}
                    >
                      <option value="local">Local Storage</option>
                      <option value="aws">Amazon S3</option>
                      <option value="azure">Azure Blob</option>
                      <option value="gcp">Google Cloud</option>
                      <option value="dropbox">Dropbox</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="maxBackupSize" className="form-label fw-semibold">Max Backup Size (GB)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxBackupSize"
                      min="1"
                      max="100"
                      value={settings.maxBackupSize || '10'}
                      onChange={(e) => handleSettingChange('maxBackupSize', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="backupCompression"
                        checked={settings.backupCompression === 'true'}
                        onChange={(e) => handleSettingChange('backupCompression', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="backupCompression">
                        Compress Backups
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="backupVerification"
                        checked={settings.backupVerification === 'true'}
                        onChange={(e) => handleSettingChange('backupVerification', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="backupVerification">
                        Verify Backups
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Tab */}
        {activeTab === 'profile' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-user me-2 text-primary"></i>
                  Personal Information
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="fullName" className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullName"
                      value={settings.fullName || ''}
                      onChange={(e) => handleSettingChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={settings.email || ''}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="phone" className="form-label fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      value={settings.phone || ''}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="jobTitle" className="form-label fw-semibold">Job Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="jobTitle"
                      value={settings.jobTitle || ''}
                      onChange={(e) => handleSettingChange('jobTitle', e.target.value)}
                      placeholder="Enter your job title"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="department" className="form-label fw-semibold">Department</label>
                    <select
                      className="form-select"
                      id="department"
                      value={settings.department || ''}
                      onChange={(e) => handleSettingChange('department', e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="management">Management</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                      <option value="finance">Finance</option>
                      <option value="it">IT</option>
                      <option value="hr">Human Resources</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-cog me-2 text-success"></i>
                  Account Preferences
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="language" className="form-label fw-semibold">Language</label>
                    <select
                      className="form-select"
                      id="language"
                      value={settings.language || 'en'}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="dateFormat" className="form-label fw-semibold">Date Format</label>
                    <select
                      className="form-select"
                      id="dateFormat"
                      value={settings.dateFormat || 'MM/DD/YYYY'}
                      onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="timeFormat" className="form-label fw-semibold">Time Format</label>
                    <select
                      className="form-select"
                      id="timeFormat"
                      value={settings.timeFormat || '12h'}
                      onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                    >
                      <option value="12h">12 Hour (AM/PM)</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotifications"
                        checked={settings.emailNotifications === 'true'}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="emailNotifications">
                        Email Notifications
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smsNotifications"
                        checked={settings.smsNotifications === 'true'}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="smsNotifications">
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-server me-2 text-primary"></i>
                  SMTP Configuration
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="smtpHost" className="form-label fw-semibold">SMTP Host</label>
                    <input
                      type="text"
                      className="form-control"
                      id="smtpHost"
                      value={settings.smtpHost || ''}
                      onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="smtpPort" className="form-label fw-semibold">Port</label>
                    <input
                      type="number"
                      className="form-control"
                      id="smtpPort"
                      value={settings.smtpPort || '587'}
                      onChange={(e) => handleSettingChange('smtpPort', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="smtpSSL"
                        checked={settings.smtpSSL === 'true'}
                        onChange={(e) => handleSettingChange('smtpSSL', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="smtpSSL">
                        Use SSL
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="smtpUsername" className="form-label fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="smtpUsername"
                      value={settings.smtpUsername || ''}
                      onChange={(e) => handleSettingChange('smtpUsername', e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="smtpPassword" className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="smtpPassword"
                      value={settings.smtpPassword || ''}
                      onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                      placeholder="Enter SMTP password"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-envelope me-2 text-success"></i>
                  Email Templates
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="fromName" className="form-label fw-semibold">From Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fromName"
                      value={settings.fromName || ''}
                      onChange={(e) => handleSettingChange('fromName', e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="fromEmail" className="form-label fw-semibold">From Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="fromEmail"
                      value={settings.fromEmail || ''}
                      onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                      placeholder="noreply@yourcompany.com"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="replyTo" className="form-label fw-semibold">Reply-To Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="replyTo"
                      value={settings.replyTo || ''}
                      onChange={(e) => handleSettingChange('replyTo', e.target.value)}
                      placeholder="support@yourcompany.com"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="emailSignature" className="form-label fw-semibold">Email Signature</label>
                    <textarea
                      className="form-control"
                      id="emailSignature"
                      rows={4}
                      value={settings.emailSignature || ''}
                      onChange={(e) => handleSettingChange('emailSignature', e.target.value)}
                      placeholder="Enter your email signature..."
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-outline-primary">
                      <i className="fas fa-paper-plane me-2"></i>
                      Test Email Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Data Tab */}
        {activeTab === 'privacy' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-shield-alt me-2 text-warning"></i>
                  Data Protection
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dataEncryption"
                        checked={settings.dataEncryption === 'true'}
                        onChange={(e) => handleSettingChange('dataEncryption', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="dataEncryption">
                        Enable Data Encryption
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="gdprCompliance"
                        checked={settings.gdprCompliance === 'true'}
                        onChange={(e) => handleSettingChange('gdprCompliance', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="gdprCompliance">
                        GDPR Compliance Mode
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dataRetention"
                        checked={settings.dataRetention === 'true'}
                        onChange={(e) => handleSettingChange('dataRetention', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="dataRetention">
                        Automatic Data Retention
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="retentionPeriod" className="form-label fw-semibold">Data Retention Period (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="retentionPeriod"
                      min="30"
                      max="2555"
                      value={settings.retentionPeriod || '365'}
                      onChange={(e) => handleSettingChange('retentionPeriod', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="anonymizeData"
                        checked={settings.anonymizeData === 'true'}
                        onChange={(e) => handleSettingChange('anonymizeData', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="anonymizeData">
                        Anonymize Deleted Data
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-user-secret me-2 text-info"></i>
                  Privacy Controls
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="trackingEnabled"
                        checked={settings.trackingEnabled === 'true'}
                        onChange={(e) => handleSettingChange('trackingEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="trackingEnabled">
                        Enable User Tracking
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="analyticsEnabled"
                        checked={settings.analyticsEnabled === 'true'}
                        onChange={(e) => handleSettingChange('analyticsEnabled', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="analyticsEnabled">
                        Enable Analytics
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="cookieConsent"
                        checked={settings.cookieConsent === 'true'}
                        onChange={(e) => handleSettingChange('cookieConsent', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="cookieConsent">
                        Show Cookie Consent
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="privacyPolicy" className="form-label fw-semibold">Privacy Policy URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="privacyPolicy"
                      value={settings.privacyPolicy || ''}
                      onChange={(e) => handleSettingChange('privacyPolicy', e.target.value)}
                      placeholder="https://yourcompany.com/privacy"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="termsOfService" className="form-label fw-semibold">Terms of Service URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="termsOfService"
                      value={settings.termsOfService || ''}
                      onChange={(e) => handleSettingChange('termsOfService', e.target.value)}
                      placeholder="https://yourcompany.com/terms"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-microchip me-2 text-primary"></i>
                  System Configuration
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="maxMemory" className="form-label fw-semibold">Max Memory Usage (MB)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxMemory"
                      min="512"
                      max="8192"
                      value={settings.maxMemory || '2048'}
                      onChange={(e) => handleSettingChange('maxMemory', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="maxCpu" className="form-label fw-semibold">Max CPU Usage (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxCpu"
                      min="50"
                      max="100"
                      value={settings.maxCpu || '80'}
                      onChange={(e) => handleSettingChange('maxCpu', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="logLevel" className="form-label fw-semibold">Log Level</label>
                    <select
                      className="form-select"
                      id="logLevel"
                      value={settings.logLevel || 'info'}
                      onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                    >
                      <option value="error">Error</option>
                      <option value="warn">Warning</option>
                      <option value="info">Info</option>
                      <option value="debug">Debug</option>
                      <option value="trace">Trace</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="debugMode"
                        checked={settings.debugMode === 'true'}
                        onChange={(e) => handleSettingChange('debugMode', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="debugMode">
                        Enable Debug Mode
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="maintenanceMode"
                        checked={settings.maintenanceMode === 'true'}
                        onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="maintenanceMode">
                        Maintenance Mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-database me-2 text-success"></i>
                  Database Settings
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="dbConnectionPool" className="form-label fw-semibold">Connection Pool Size</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dbConnectionPool"
                      min="5"
                      max="100"
                      value={settings.dbConnectionPool || '20'}
                      onChange={(e) => handleSettingChange('dbConnectionPool', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="dbTimeout" className="form-label fw-semibold">Query Timeout (seconds)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dbTimeout"
                      min="5"
                      max="300"
                      value={settings.dbTimeout || '30'}
                      onChange={(e) => handleSettingChange('dbTimeout', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dbBackup"
                        checked={settings.dbBackup === 'true'}
                        onChange={(e) => handleSettingChange('dbBackup', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="dbBackup">
                        Automatic Database Backup
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dbOptimization"
                        checked={settings.dbOptimization === 'true'}
                        onChange={(e) => handleSettingChange('dbOptimization', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="dbOptimization">
                        Enable Query Optimization
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="dbCleanup" className="form-label fw-semibold">Auto Cleanup (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dbCleanup"
                      min="1"
                      max="90"
                      value={settings.dbCleanup || '30'}
                      onChange={(e) => handleSettingChange('dbCleanup', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customization Tab */}
        {activeTab === 'customization' && (
          <div className="row g-4 animate-slide-in">
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-palette me-2 text-primary"></i>
                  Branding & Colors
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="primaryColor" className="form-label fw-semibold">Primary Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="primaryColor"
                      value={settings.primaryColor || '#2ECC71'}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="secondaryColor" className="form-label fw-semibold">Secondary Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="secondaryColor"
                      value={settings.secondaryColor || '#3498DB'}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="accentColor" className="form-label fw-semibold">Accent Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      id="accentColor"
                      value={settings.accentColor || '#E74C3C'}
                      onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="logoUrl" className="form-label fw-semibold">Logo URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="logoUrl"
                      value={settings.logoUrl || ''}
                      onChange={(e) => handleSettingChange('logoUrl', e.target.value)}
                      placeholder="https://yourcompany.com/logo.png"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="faviconUrl" className="form-label fw-semibold">Favicon URL</label>
                    <input
                      type="url"
                      className="form-control"
                      id="faviconUrl"
                      value={settings.faviconUrl || ''}
                      onChange={(e) => handleSettingChange('faviconUrl', e.target.value)}
                      placeholder="https://yourcompany.com/favicon.ico"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="modern-card p-4">
                <h5 className="fw-bold text-dark mb-4">
                  <i className="fas fa-desktop me-2 text-success"></i>
                  UI Customization
                </h5>
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="fontFamily" className="form-label fw-semibold">Font Family</label>
                    <select
                      className="form-select"
                      id="fontFamily"
                      value={settings.fontFamily || 'Inter'}
                      onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Poppins">Poppins</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="fontSize" className="form-label fw-semibold">Base Font Size</label>
                    <select
                      className="form-select"
                      id="fontSize"
                      value={settings.fontSize || '14px'}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    >
                      <option value="12px">Small (12px)</option>
                      <option value="14px">Medium (14px)</option>
                      <option value="16px">Large (16px)</option>
                      <option value="18px">Extra Large (18px)</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="roundedCorners"
                        checked={settings.roundedCorners === 'true'}
                        onChange={(e) => handleSettingChange('roundedCorners', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="roundedCorners">
                        Rounded Corners
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="animations"
                        checked={settings.animations === 'true'}
                        onChange={(e) => handleSettingChange('animations', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="animations">
                        Enable Animations
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="compactMode"
                        checked={settings.compactMode === 'true'}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked.toString())}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="compactMode">
                        Compact Mode
                      </label>
                    </div>
                  </div>
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