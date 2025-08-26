
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: 'fas fa-chart-line',
    href: '/',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Inventory',
    icon: 'fas fa-boxes',
    href: '/inventory',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Customers',
    icon: 'fas fa-users',
    href: '/customers',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Loyalty',
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
    title: 'Vendors',
    icon: 'fas fa-building',
    href: '/vendors',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'AI Insights',
    icon: 'fas fa-brain',
    href: '/ai-recommendations',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Finance',
    icon: 'fas fa-dollar-sign',
    href: '/reports',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Chart of Accounts',
    icon: 'fas fa-balance-scale',
    href: '/chart-of-accounts',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'General Ledger',
    icon: 'fas fa-book',
    href: '/general-ledger',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Journal Entries',
    icon: 'fas fa-pen-to-square',
    href: '/journal-entries',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Accounts Receivable',
    icon: 'fas fa-file-invoice-dollar',
    href: '/accounts-receivable',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Accounts Payable',
    icon: 'fas fa-file-invoice',
    href: '/accounts-payable',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Wallets & Credits',
    icon: 'fas fa-wallet',
    href: '/wallets',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Financial Reports',
    icon: 'fas fa-chart-bar',
    href: '/financial-reports',
    roles: ['superadmin', 'admin']
  },
  // Advanced Accounts Module
  {
    title: 'Manual Journal Entry',
    icon: 'fas fa-balance-scale-right',
    href: '/manual-journal-entry',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Bank Reconciliation',
    icon: 'fas fa-university',
    href: '/bank-reconciliation',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Invoice Management',
    icon: 'fas fa-file-invoice-dollar',
    href: '/invoice-management',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Tax Management',
    icon: 'fas fa-percentage',
    href: '/tax-management',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Settings',
    icon: 'fas fa-cog',
    href: '/settings',
    roles: ['superadmin', 'admin']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={`modern-sidebar animate-slide-in-left ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Section */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center">
          <div className="brand-icon">
            <i className="fas fa-store text-white"></i>
          </div>
          {!collapsed && (
            <div className="ms-3">
              <h5 className="text-white mb-0 fw-bold">ShopifyApp</h5>
              <small className="text-white-50">Business Suite</small>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-3 border-bottom border-white border-opacity-10">
        <div className="d-flex align-items-center">
          <div className="position-relative">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center bg-gradient-shopify" 
              style={{width: '40px', height: '40px'}}
            >
              <span className="text-white fw-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div 
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
              style={{width: '12px', height: '12px'}}
            ></div>
          </div>
          {!collapsed && (
            <div className="ms-3 flex-fill">
              <div className="text-white fw-semibold small">{user?.name}</div>
              <div className="text-white-50 text-capitalize" style={{fontSize: '0.75rem'}}>
                {user?.role}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-fill py-3" style={{overflowY: 'auto'}}>
        <nav>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <div key={item.href} className="sidebar-nav-item">
                <Link 
                  to={item.href} 
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  data-bs-toggle="tooltip" 
                  data-bs-placement="right" 
                  title={collapsed ? item.title : ''}
                >
                  <i className={`${item.icon} sidebar-nav-icon`}></i>
                  {!collapsed && (
                    <>
                      <span className="flex-fill">{item.title}</span>
                      {isActive && <i className="fas fa-chevron-right ms-auto"></i>}
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-top border-white border-opacity-10">
        <div className="sidebar-nav-item">
          <button 
            onClick={logout}
            className="sidebar-nav-link w-100 border-0 bg-transparent text-start"
            style={{color: 'rgba(255, 107, 107, 0.9)'}}
          >
            <i className="fas fa-sign-out-alt sidebar-nav-icon"></i>
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
};
