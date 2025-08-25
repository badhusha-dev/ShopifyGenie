import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

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
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const [notifications] = useState(3); // Mock notification count

  return (
    <nav className="modern-navbar navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Left Section */}
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary d-lg-none me-3"
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>

          <div>
            <h1 className="h4 mb-0 fw-bold text-dark">{title}</h1>
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className="d-none d-md-flex flex-fill justify-content-center mx-4">
            <div className="position-relative" style={{maxWidth: '400px', width: '100%'}}>
              <i className="fas fa-search position-absolute text-muted" 
                 style={{left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem'}}></i>
              <input
                type="text"
                className="form-control navbar-search ps-5"
                placeholder="Search products, customers, orders..."
                style={{borderRadius: '12px'}}
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="d-flex align-items-center gap-3">
          <LanguageSwitcher />

          {/* Dark Mode Toggle */}
          <button 
            className="btn btn-outline-secondary btn-sm btn-ripple"
            onClick={toggleDarkMode}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {/* Notifications */}
          <div className="dropdown">
            <button className="btn btn-outline-secondary btn-sm position-relative btn-ripple" type="button" data-bs-toggle="dropdown">
              <i className="fas fa-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">unread messages</span>
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><h6 className="dropdown-header">Recent Notifications</h6></li>
              <li><a className="dropdown-item" href="#"><i className="fas fa-info-circle me-2 text-info"></i>New customer registered</a></li>
              <li><a className="dropdown-item" href="#"><i className="fas fa-exclamation-triangle me-2 text-warning"></i>Low stock alert: Product ABC</a></li>
              <li><a className="dropdown-item" href="#"><i className="fas fa-check-circle me-2 text-success"></i>Order #1234 completed</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-center" href="#">View all notifications</a></li>
            </ul>
          </div>

          {/* User Menu */}
          <div className="dropdown">
            <button
              className="btn btn-link text-decoration-none d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="position-relative me-2">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-gradient-shopify"
                  style={{width: '35px', height: '35px'}}
                >
                  <span className="text-white fw-bold small">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div 
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                  style={{width: '10px', height: '10px'}}
                ></div>
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold text-dark small">{user?.name}</div>
                <div className="text-muted text-capitalize" style={{fontSize: '0.75rem'}}>
                  {user?.role}
                </div>
              </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <h6 className="dropdown-header">
                  <i className="fas fa-user me-2"></i>My Account
                </h6>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" type="button">
                  <i className="fas fa-user-edit me-2"></i>Profile
                </button>
              </li>
              <li>
                <button className="dropdown-item" type="button">
                  <i className="fas fa-cog me-2"></i>Settings
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item text-danger" 
                  type="button"
                  onClick={logout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>Sign out
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