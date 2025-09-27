
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme, themeColors } from '../design/tokens';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

const ThemeSettings: React.FC = () => {
  const { currentTheme, setTheme, isDark } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<Theme>(currentTheme);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const queryClient = useQueryClient();

  const saveThemeMutation = useMutation({
    mutationFn: async (theme: Theme) => {
      return apiRequest('PUT', '/api/system/theme', { theme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/system/settings'] });
      setIsPreviewMode(false);
    },
  });

  const themes: { key: Theme; name: string; description: string; gradient: string }[] = [
    {
      key: 'emerald',
      name: 'Shopify Green',
      description: 'Classic Shopify green with natural feel',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      key: 'blue',
      name: 'Ocean Blue',
      description: 'Professional blue for corporate feel',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      key: 'purple',
      name: 'Royal Purple',
      description: 'Creative purple for modern brands',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
    },
    {
      key: 'coral',
      name: 'Vibrant Coral',
      description: 'Energetic coral for bold brands',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    }
  ];

  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    setIsPreviewMode(true);
    // Temporarily apply theme for preview
    document.body.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-coral');
    document.body.classList.add(`theme-${theme}`);
  };

  const handleSave = () => {
    setTheme(previewTheme);
    saveThemeMutation.mutate(previewTheme);
  };

  const handleCancel = () => {
    setIsPreviewMode(false);
    setPreviewTheme(currentTheme);
    // Restore original theme
    document.body.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-coral');
    document.body.classList.add(`theme-${currentTheme}`);
  };

  return (
    <div className="theme-settings">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold text-dark mb-1">
                <i className="fas fa-palette me-2 text-primary"></i>
                Theme Customization
              </h5>
              <p className="text-muted mb-0">Customize the visual appearance of your application</p>
            </div>
            {isPreviewMode && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-sm btn-ripple"
                  onClick={handleSave}
                  disabled={saveThemeMutation.isPending}
                >
                  {saveThemeMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Theme
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPreviewMode && (
        <div className="alert alert-info animate-slide-down mb-4" role="alert">
          <i className="fas fa-eye me-2"></i>
          <strong>Preview Mode:</strong> You're currently previewing the {themes.find(t => t.key === previewTheme)?.name} theme. 
          Save to apply permanently or cancel to revert.
        </div>
      )}

      <div className="row g-4">
        {themes.map((theme) => (
          <div key={theme.key} className="col-md-6">
            <div className={`theme-card modern-card p-4 ${previewTheme === theme.key ? 'active' : ''} ${currentTheme === theme.key && !isPreviewMode ? 'current' : ''}`}>
              <div className="d-flex align-items-start gap-3">
                <div 
                  className="theme-preview rounded-3"
                  style={{ 
                    background: theme.gradient,
                    width: '80px',
                    height: '60px',
                    position: 'relative'
                  }}
                >
                  <div className="theme-preview-overlay"></div>
                  {currentTheme === theme.key && !isPreviewMode && (
                    <div className="current-badge">
                      <i className="fas fa-check text-white"></i>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold text-dark mb-1">{theme.name}</h6>
                    {currentTheme === theme.key && !isPreviewMode && (
                      <span className="badge bg-success-subtle text-success">Current</span>
                    )}
                    {previewTheme === theme.key && isPreviewMode && (
                      <span className="badge bg-warning-subtle text-warning">Previewing</span>
                    )}
                  </div>
                  <p className="text-muted small mb-3">{theme.description}</p>
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm btn-ripple"
                      onClick={() => handlePreview(theme.key)}
                      disabled={previewTheme === theme.key && isPreviewMode}
                    >
                      <i className="fas fa-eye me-1"></i>
                      Preview
                    </button>
                    
                    {currentTheme !== theme.key && (
                      <button
                        className="btn btn-primary btn-sm btn-ripple"
                        onClick={() => {
                          setPreviewTheme(theme.key);
                          setTheme(theme.key);
                          saveThemeMutation.mutate(theme.key);
                        }}
                        disabled={saveThemeMutation.isPending}
                      >
                        <i className="fas fa-check me-1"></i>
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="modern-card p-4">
            <h6 className="fw-bold text-dark mb-3">
              <i className="fas fa-info-circle me-2 text-info"></i>
              Theme Information
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted">Current Theme:</span>
                  <span className="fw-semibold">{themes.find(t => t.key === currentTheme)?.name}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted">Dark Mode:</span>
                  <span className="fw-semibold">{isDark ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted">Primary Color:</span>
                  <div className="d-flex align-items-center gap-2">
                    <div 
                      className="color-swatch rounded-circle"
                      style={{ 
                        backgroundColor: themeColors[currentTheme],
                        width: '20px',
                        height: '20px'
                      }}
                    ></div>
                    <code className="small">{themeColors[currentTheme]}</code>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted">Last Modified:</span>
                  <span className="fw-semibold small">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .theme-card {
          transition: all var(--duration-normal) ease;
          border: 2px solid transparent;
          cursor: pointer;
        }

        .theme-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--bs-primary);
        }

        .theme-card.active {
          border-color: var(--bs-warning);
          background-color: var(--bs-warning-bg-subtle);
        }

        .theme-card.current {
          border-color: var(--bs-success);
          background-color: var(--bs-success-bg-subtle);
        }

        .theme-preview {
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: var(--shadow-md);
        }

        .theme-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
                      linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
                      linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%);
          background-size: 10px 10px;
          background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
        }

        .current-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          background: var(--bs-success);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          border: 2px solid white;
        }

        .color-swatch {
          border: 2px solid var(--bs-border-color);
        }

        /* Dark mode adjustments */
        [data-bs-theme="dark"] .current-badge {
          border-color: var(--bs-dark);
        }

        [data-bs-theme="dark"] .color-swatch {
          border-color: var(--bs-border-color);
        }
      `}</style>
    </div>
  );
};

export default ThemeSettings;
