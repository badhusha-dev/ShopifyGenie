import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleDarkMode } from '../store/slices/themeSlice';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSettings from './ThemeSettings';
import { useTranslation } from '../hooks/useTranslation';
import logoImage from '../assets/logo.jpeg';

interface TopNavProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  showSearch?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ 
  title, 
  subtitle, 
  onMenuToggle,
  showSearch = true 
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isDark } = useAppSelector((state) => state.theme);
  const { t } = useTranslation();
  const [notifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [themeColors] = useState(['emerald', 'blue', 'purple', 'coral']);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('accentColor') || 'blue');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('accentColor', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <nav className="modern-navbar navbar navbar-expand-lg border-bottom animate__animated animate__fadeInDown" data-bs-theme={isDark ? 'dark' : 'light'}>
      <div className="container-fluid">
        {/* Left Section - Logo & App Name */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary d-lg-none me-3 btn-ripple"
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
            data-testid="button-menu-toggle"
          >
            <i className="fas fa-bars"></i>
          </button>

          <div className="d-flex align-items-center">
            <div className="nav-logo me-3">
              <div 
                className="rounded d-flex align-items-center justify-content-center"
                style={{
                  width: '40px', 
                  height: '40px',
                  background: 'transparent'
                }}
              >
                <img 
                  src={logoImage} 
                  alt="Shopify Gennie" 
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div>
              <h1 className="h5 mb-0 fw-bold gradient-text" data-testid="text-app-title">
                Shopify Gennie
              </h1>
              <small className="text-muted d-none d-md-inline" data-testid="text-subtitle">
                {subtitle || 'Advanced Accounting & Analytics'}
              </small>
            </div>
          </div>
        </div>

        {/* Center Section - Animated Search */}
        {showSearch && (
          <div className="d-none d-md-flex flex-fill justify-content-center mx-4">
            <div 
              className={`position-relative search-container ${isSearchExpanded ? 'expanded' : ''}`}
              style={{
                maxWidth: '500px', 
                width: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <i className="fas fa-search position-absolute text-muted search-icon" 
                 style={{
                   left: '16px', 
                   top: '50%', 
                   transform: 'translateY(-50%)', 
                   fontSize: '0.875rem',
                   transition: 'all 0.3s ease'
                 }}></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search products, customers, orders, invoices..."
                onFocus={() => setIsSearchExpanded(true)}
                onBlur={() => setIsSearchExpanded(false)}
                data-testid="input-search"
                style={{
                  borderRadius: '25px',
                  paddingLeft: '50px',
                  paddingRight: '20px',
                  height: '42px',
                  border: `2px solid var(--bs-border-color)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSearchExpanded ? `0 4px 20px rgba(var(--bs-${currentTheme}-rgb), 0.15)` : 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="d-flex align-items-center gap-2">
          {/* Live Clock */}
          <div 
            className="clock-display d-none d-sm-flex align-items-center me-3"
            data-testid="text-live-clock"
            style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--bs-text-emphasis)',
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid var(--bs-border-color)',
              minWidth: '80px',
              justifyContent: 'center'
            }}
          >
            <i className="fas fa-clock me-2" style={{fontSize: '0.8rem'}}></i>
            <span className="time-text">{formatTime(currentTime)}</span>
          </div>

          <div className="me-2">
            <LanguageSwitcher />
          </div>

          {/* Theme Customizer (Super Admin only) */}
          {user?.role === 'superadmin' && (
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary btn-sm btn-ripple position-relative"
                type="button"
                data-bs-toggle="dropdown"
                title="Theme Customizer"
                data-testid="button-theme-customizer"
              >
                <i className="fas fa-palette"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end p-3" style={{minWidth: '200px'}}>
                <li><h6 className="dropdown-header">Theme Colors</h6></li>
                <li>
                  <div className="d-flex gap-2 flex-wrap">
                    {themeColors.map(color => (
                      <button
                        key={color}
                        className={`btn btn-sm rounded-circle ${currentTheme === color ? 'border-3 border-white shadow' : ''}`}
                        style={{
                          width: '30px',
                          height: '30px',
                          background: `var(--bs-${color})`,
                          border: `2px solid ${currentTheme === color ? 'var(--bs-body-color)' : 'transparent'}`
                        }}
                        onClick={() => handleThemeChange(color)}
                        title={`${color.charAt(0).toUpperCase() + color.slice(1)} theme`}
                        data-testid={`button-theme-${color}`}
                      />
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button 
            className="btn btn-outline-secondary btn-sm btn-ripple hover-lift"
            onClick={handleToggleDarkMode}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            data-testid="button-theme-toggle"
          >
            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {/* Notifications with Animation */}
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary btn-sm position-relative btn-ripple hover-lift" 
              type="button" 
              data-bs-toggle="dropdown"
              data-testid="button-notifications"
            >
              <i className="fas fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge animate__animated animate__pulse animate__infinite">
                {notifications}
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end animate__animated animate__fadeIn" style={{minWidth: '320px'}}>
              <li><h6 className="dropdown-header d-flex justify-content-between align-items-center">
                <span><i className="fas fa-bell me-2"></i>Notifications</span>
                <span className="badge bg-primary rounded-pill">{notifications}</span>
              </h6></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item notification-item" href="#" data-testid="link-notification-1">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-info d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                        <i className="fas fa-user-plus text-white small"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">New customer registered</div>
                      <div className="text-muted small">2 minutes ago</div>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item notification-item" href="#" data-testid="link-notification-2">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                        <i className="fas fa-exclamation-triangle text-white small"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">Low stock alert</div>
                      <div className="text-muted small">Product ABC - 5 minutes ago</div>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a className="dropdown-item notification-item" href="#" data-testid="link-notification-3">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
                        <i className="fas fa-check-circle text-white small"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">Order completed</div>
                      <div className="text-muted small">Order #1234 - 10 minutes ago</div>
                    </div>
                  </div>
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-center fw-semibold" href="#" data-testid="link-view-all-notifications">View all notifications</a></li>
            </ul>
          </div>

          {/* Enhanced User Menu */}
          <div className="dropdown">
            <button
              className="btn btn-link text-decoration-none d-flex align-items-center hover-lift"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              data-testid="button-user-menu"
            >
              <div className="position-relative me-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center user-avatar"
                  style={{
                    width: '38px', 
                    height: '38px',
                    background: `linear-gradient(135deg, var(--bs-${currentTheme}), var(--bs-${currentTheme}-dark, #0056b3))`,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <span className="text-white fw-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div 
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white online-indicator"
                  style={{width: '12px', height: '12px'}}
                ></div>
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold small" data-testid="text-username">{user?.name}</div>
                <div className="text-muted text-capitalize" style={{fontSize: '0.75rem'}} data-testid="text-user-role">
                  {user?.role}
                </div>
              </div>
              <i className="fas fa-chevron-down ms-2 small text-muted"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end animate__animated animate__fadeIn" style={{minWidth: '220px'}}>
              <li>
                <div className="dropdown-header border-bottom">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '32px', 
                        height: '32px',
                        background: `linear-gradient(135deg, var(--bs-${currentTheme}), var(--bs-${currentTheme}-dark, #0056b3))`
                      }}
                    >
                      <span className="text-white fw-bold small">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="fw-semibold small">{user?.name}</div>
                      <div className="text-muted small">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <button className="dropdown-item" type="button" data-testid="button-profile">
                  <i className="fas fa-user-edit me-3 text-primary"></i>Edit Profile
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button" data-testid="button-settings">
                  <i className="fas fa-cog me-3 text-secondary"></i>Account Settings
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button" data-testid="button-billing">
                  <i className="fas fa-credit-card me-3 text-info"></i>Billing & Plans
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" type="button" data-testid="button-help">
                  <i className="fas fa-question-circle me-3 text-warning"></i>Help & Support
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item text-danger" 
                  type="button"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <i className="fas fa-sign-out-alt me-3"></i>Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;