
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
        <div className="d-flex align-items-center">
          {/* Language Switcher */}
          <div className="dropdown me-2">
            <button
              className="btn btn-outline-secondary rounded-circle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{width: '40px', height: '40px'}}
            >
              <i className="fas fa-globe"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item" type="button">🇺🇸 English</button></li>
              <li><button className="dropdown-item" type="button">🇪🇸 Español</button></li>
              <li><button className="dropdown-item" type="button">🇫🇷 Français</button></li>
            </ul>
          </div>

          {/* Notifications */}
          <div className="position-relative me-2">
            <button
              className="btn btn-outline-secondary rounded-circle position-relative"
              type="button"
              style={{width: '40px', height: '40px'}}
            >
              <i className="fas fa-bell"></i>
              {notifications > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications}
                  <span className="visually-hidden">unread messages</span>
                </span>
              )}
            </button>
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
