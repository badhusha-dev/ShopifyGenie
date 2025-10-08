import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import logoImage from '../assets/logo.png';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuSections = [
  {
    title: 'Business Overview',
    items: [
      {
        title: 'Dashboard',
        icon: 'fas fa-chart-line',
        href: '/',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'AI Insights',
        icon: 'fas fa-brain',
        href: '/ai-insights',
        roles: ['superadmin', 'admin', 'staff']
      }
    ]
  },
  {
    title: 'Operations',
    items: [
      {
        title: 'Inventory',
        icon: 'fas fa-boxes',
        href: '/inventory',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Inventory Reports',
        icon: 'fas fa-chart-bar',
        href: '/inventory-reports',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Customers',
        icon: 'fas fa-users',
        href: '/customers',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Loyalty Program',
        icon: 'fas fa-heart',
        href: '/loyalty',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Subscriptions',
        icon: 'fas fa-credit-card',
        href: '/subscriptions',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Vendor Management',
        icon: 'fas fa-building',
        href: '/vendors',
        roles: ['superadmin', 'admin']
      }
    ]
  },
  {
    title: 'Financial Management',
    items: [
      {
        title: 'Finance Dashboard',
        icon: 'fas fa-chart-pie',
        href: '/reports',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Financial Reports',
        icon: 'fas fa-chart-bar',
        href: '/accounting/financial-reports',
        roles: ['superadmin', 'admin']
      }
    ]
  },
  {
    title: 'Accounting',
    items: [
      {
        title: 'Chart of Accounts',
        icon: 'fas fa-list-alt',
        href: '/accounting/chart-of-accounts',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'General Ledger',
        icon: 'fas fa-book',
        href: '/accounting/general-ledger',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Journal Entries',
        icon: 'fas fa-pen-to-square',
        href: '/accounting/journal-entries',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Manual Entry',
        icon: 'fas fa-edit',
        href: '/accounting/manual-journal-entry',
        roles: ['superadmin', 'admin']
      }
    ]
  },
  {
    title: 'Receivables & Payables',
    items: [
      {
        title: 'Accounts Receivable',
        icon: 'fas fa-file-invoice-dollar',
        href: '/accounting/accounts-receivable',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Accounts Payable',
        icon: 'fas fa-file-invoice',
        href: '/accounting/accounts-payable',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Invoice Management',
        icon: 'fas fa-receipt',
        href: '/accounting/invoices',
        roles: ['superadmin', 'admin']
      }
    ]
  },
  {
    title: 'Banking & Compliance',
    items: [
      {
        title: 'Bank Reconciliation',
        icon: 'fas fa-university',
        href: '/accounting/bank-reconciliation',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Wallets & Credits',
        icon: 'fas fa-wallet',
        href: '/accounting/wallets',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Tax Management',
        icon: 'fas fa-percentage',
        href: '/tax-management',
        roles: ['superadmin', 'admin']
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        icon: 'fas fa-cog',
        href: '/settings',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'System Monitoring',
        icon: 'fas fa-server',
        href: '/system-monitoring',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Help & Support',
        icon: 'fas fa-question-circle',
        href: '/help-support',
        roles: ['superadmin', 'admin', 'staff']
      },
      {
        title: 'Data Management',
        icon: 'fas fa-database',
        href: '/data-management',
        roles: ['superadmin', 'admin'],
        description: 'Export, import, backup & restore data'
      },
      {
        title: 'Workflow Automation',
        icon: 'fas fa-cogs',
        href: '/workflow-automation',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'Advanced Reports',
        icon: 'fas fa-chart-line',
        href: '/advanced-reports',
        roles: ['superadmin', 'admin']
      },
      {
        title: 'PWA Management',
        icon: 'fas fa-mobile-alt',
        href: '/pwa-management',
        roles: ['superadmin', 'admin']
      }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [location] = useLocation();
  
  const handleLogout = () => {
    dispatch(logout());
  };


  const filteredMenuSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => user && item.roles.includes(user.role))
  })).filter(section => section.items.length > 0);

  return (
    <div className={`modern-sidebar ${!collapsed ? 'expanded' : 'collapsed'}`}>
      {/* Brand Section */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center">
          <div className="brand-icon">
            <img 
              src={logoImage} 
              alt="Shopify Gennie" 
              className="brand-logo"
            />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <h5 className="text-white mb-0 fw-bold">Shopify Gennie</h5>
              <small className="text-white-50">Business Suite</small>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="user-profile">
        <div className="d-flex align-items-center">
          <div className="user-avatar">
            <span className="avatar-text">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="nav-container">
        <nav className="nav">
          {filteredMenuSections.map((section, sectionIndex) => (
            <div key={section.title} className="nav-section">
              {!collapsed && (
                <div className="section-title">
                  <span className="title-text">{section.title}</span>
                </div>
              )}
              <div className="nav-items">
                {section.items.map((item, itemIndex) => {
                  const isActive = location === item.href;
                  return (
                    <div key={item.href} className="nav-item">
                      <Link 
                        to={item.href} 
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        data-bs-toggle="tooltip" 
                        data-bs-placement="right" 
                        title={collapsed ? item.title : ''}
                      >
                        <div className="nav-icon">
                          <i className={`${item.icon}`}></i>
                        </div>
                        {!collapsed && (
                          <div className="nav-content">
                            <span className="nav-text">{item.title}</span>
                            {isActive && (
                              <div className="active-indicator">
                                <i className="fas fa-chevron-right"></i>
                              </div>
                            )}
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="footer">
        <div className="logout-btn">
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            <div className="logout-icon">
              <i className="fas fa-sign-out-alt"></i>
            </div>
            {!collapsed && (
              <div className="logout-text">
                <span>Sign Out</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};