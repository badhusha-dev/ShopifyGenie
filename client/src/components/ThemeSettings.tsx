import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaPalette, FaCog, FaEye, FaFont, FaAdjust, FaSave, FaUndo } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
}

const ThemeSettings: React.FC = () => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('theme-settings');
    return saved ? JSON.parse(saved) : {
      mode: 'light',
      primaryColor: '#2ECC71',
      secondaryColor: '#3498db',
      accentColor: '#e74c3c',
      fontSize: 'medium',
      borderRadius: 'medium',
      animations: true,
      compactMode: false,
      sidebarCollapsed: false
    };
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const colorPresets = [
    { name: 'Shopify Green', primary: '#2ECC71', secondary: '#3498db', accent: '#e74c3c' },
    { name: 'Ocean Blue', primary: '#3498db', secondary: '#2980b9', accent: '#e67e22' },
    { name: 'Purple Dream', primary: '#9b59b6', secondary: '#8e44ad', accent: '#f39c12' },
    { name: 'Sunset Orange', primary: '#e67e22', secondary: '#d35400', accent: '#e74c3c' },
    { name: 'Forest Green', primary: '#27ae60', secondary: '#2ecc71', accent: '#f39c12' },
    { name: 'Midnight Blue', primary: '#2c3e50', secondary: '#34495e', accent: '#e74c3c' }
  ];

  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  const applyTheme = (themeSettings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (themeSettings.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-bs-theme', themeSettings.mode);
    }

    // Apply custom colors
    root.style.setProperty('--shopify-green', themeSettings.primaryColor);
    root.style.setProperty('--shopify-blue', themeSettings.secondaryColor);
    root.style.setProperty('--coral-accent', themeSettings.accentColor);

    // Apply font size
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[themeSettings.fontSize]);

    // Apply border radius
    const borderRadiusMap = { none: '0px', small: '4px', medium: '8px', large: '12px' };
    root.style.setProperty('--border-radius', borderRadiusMap[themeSettings.borderRadius]);

    // Apply animations
    if (!themeSettings.animations) {
      root.style.setProperty('--transition-fast', '0ms');
      root.style.setProperty('--transition-normal', '0ms');
      root.style.setProperty('--transition-slow', '0ms');
    } else {
      root.style.setProperty('--transition-fast', '150ms ease');
      root.style.setProperty('--transition-normal', '250ms ease');
      root.style.setProperty('--transition-slow', '350ms ease');
    }

    // Apply compact mode
    if (themeSettings.compactMode) {
      root.style.setProperty('--sidebar-width', '200px');
      root.style.setProperty('--header-height', '48px');
    } else {
      root.style.setProperty('--sidebar-width', '280px');
      root.style.setProperty('--header-height', '64px');
    }
  };

  const handleSettingChange = (key: keyof ThemeSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
    setHasChanges(false);
  };

  const resetSettings = () => {
    const defaultSettings: ThemeSettings = {
      mode: 'light',
      primaryColor: '#2ECC71',
      secondaryColor: '#3498db',
      accentColor: '#e74c3c',
      fontSize: 'medium',
      borderRadius: 'medium',
      animations: true,
      compactMode: false,
      sidebarCollapsed: false
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }));
    setHasChanges(true);
  };

  return (
    <AnimatedCard>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Theme & Preferences</h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <FaEye className="me-1" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <FaPalette className="text-primary" />
        </div>
      </div>
      <div className="card-body">
        {/* Theme Mode */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Theme Mode</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div 
                className={`theme-option p-3 border rounded cursor-pointer ${settings.mode === 'light' ? 'border-primary bg-primary-subtle' : ''}`}
                onClick={() => handleSettingChange('mode', 'light')}
              >
                <FaSun className="text-warning mb-2" size={24} />
                <div className="fw-semibold">Light</div>
                <div className="small text-muted">Clean and bright interface</div>
              </div>
            </div>
            <div className="col-md-4">
              <div 
                className={`theme-option p-3 border rounded cursor-pointer ${settings.mode === 'dark' ? 'border-primary bg-primary-subtle' : ''}`}
                onClick={() => handleSettingChange('mode', 'dark')}
              >
                <FaMoon className="text-info mb-2" size={24} />
                <div className="fw-semibold">Dark</div>
                <div className="small text-muted">Easy on the eyes</div>
              </div>
            </div>
            <div className="col-md-4">
              <div 
                className={`theme-option p-3 border rounded cursor-pointer ${settings.mode === 'auto' ? 'border-primary bg-primary-subtle' : ''}`}
                onClick={() => handleSettingChange('mode', 'auto')}
              >
                <FaAdjust className="text-secondary mb-2" size={24} />
                <div className="fw-semibold">Auto</div>
                <div className="small text-muted">Follows system preference</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Presets */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Color Presets</h6>
          <div className="row g-2">
            {colorPresets.map((preset, index) => (
              <div key={index} className="col-md-4 col-lg-2">
                <div 
                  className="color-preset p-2 border rounded cursor-pointer"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="d-flex gap-1 mb-2">
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: preset.primary, width: '20px', height: '20px', borderRadius: '4px' }}
                    ></div>
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: preset.secondary, width: '20px', height: '20px', borderRadius: '4px' }}
                    ></div>
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: preset.accent, width: '20px', height: '20px', borderRadius: '4px' }}
                    ></div>
                  </div>
                  <div className="small fw-semibold">{preset.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Custom Colors</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Primary Color</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Secondary Color</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={settings.secondaryColor}
                  onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  value={settings.secondaryColor}
                  onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Accent Color</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  value={settings.accentColor}
                  onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  value={settings.accentColor}
                  onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Typography & Layout</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Font Size</label>
              <select
                className="form-select"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Border Radius</label>
              <select
                className="form-select"
                value={settings.borderRadius}
                onChange={(e) => handleSettingChange('borderRadius', e.target.value)}
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Layout Mode</label>
              <select
                className="form-select"
                value={settings.compactMode ? 'compact' : 'normal'}
                onChange={(e) => handleSettingChange('compactMode', e.target.value === 'compact')}
              >
                <option value="normal">Normal</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accessibility & Performance */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Accessibility & Performance</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="animations"
                  checked={settings.animations}
                  onChange={(e) => handleSettingChange('animations', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="animations">
                  Enable Animations
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sidebarCollapsed"
                  checked={settings.sidebarCollapsed}
                  onChange={(e) => handleSettingChange('sidebarCollapsed', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="sidebarCollapsed">
                  Collapsed Sidebar by Default
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            <FaSave className="me-1" />
            Save Changes
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={resetSettings}
          >
            <FaUndo className="me-1" />
            Reset to Default
          </button>
        </div>

        {hasChanges && (
          <div className="mt-3">
            <div className="alert alert-info">
              <FaCog className="me-2" />
              You have unsaved changes. Click "Save Changes" to apply them.
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default ThemeSettings;