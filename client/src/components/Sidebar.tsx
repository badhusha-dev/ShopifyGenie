import React from 'react';
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
      }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  const [location] = useLocation();

  const filteredMenuSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => user && item.roles.includes(user.role))
  })).filter(section => section.items.length > 0);

  return (
    <div className={`modern-sidebar animate-slide-in-left ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Section */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center">
          <div className="brand-icon">
            <img 
              src={logoImage} 
              alt="Shopify Gennie" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
          </div>
          {!collapsed && (
            <div className="ms-3">
              <h5 className="text-white mb-0 fw-bold">Shopify Gennie</h5>
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
          {filteredMenuSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-3">
              {!collapsed && (
                <div className="px-3 mb-2">
                  <small className="text-white-50 fw-semibold text-uppercase tracking-wider" 
                         style={{fontSize: '0.7rem', letterSpacing: '0.05em'}}>
                    {section.title}
                  </small>
                </div>
              )}
              {section.items.map((item) => {
                const isActive = location === item.href;
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
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-top border-white border-opacity-10">
        <div className="sidebar-nav-item">
          <button 
            onClick={handleLogout}
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