import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from '../contexts/PermissionContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { t } = useTranslation();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navigationItems = [
      {
        path: "/",
        icon: "fas fa-tachometer-alt",
        label: t('nav.dashboard'),
        permission: "dashboard:view"
      },
      {
        path: "/inventory",
        icon: "fas fa-boxes",
        label: t('nav.inventory'),
        permission: "inventory:view"
      },
      {
        path: "/customers",
        icon: "fas fa-users",
        label: t('nav.customers'),
        permission: "customers:view"
      },
      {
        path: "/subscriptions",
        icon: "fas fa-sync-alt",
        label: t('nav.subscriptions'),
        permission: "subscriptions:view"
      },
      {
        path: "/loyalty",
        icon: "fas fa-star",
        label: t('nav.loyalty'),
        permission: "customers:view"
      },
      {
        path: "/reports",
        icon: "fas fa-chart-bar",
        label: t('nav.reports'),
        permission: "reports:view"
      },
      {
        path: "/customer-portal",
        icon: "fas fa-user-circle",
        label: t('nav.customerPortal'),
        permission: "dashboard:view",
        customerOnly: true
      },
      {
        path: "/ai-insights",
        icon: "fas fa-brain",
        label: t('nav.aiInsights'),
        permission: "reports:view"
      },
      {
        path: "/ai-recommendations",
        icon: "fas fa-lightbulb",
        label: t('nav.aiRecommendations'),
        permission: "customers:view"
      },
      {
        path: "/advanced-inventory",
        icon: "fas fa-warehouse",
        label: t('nav.advancedInventory'),
        permission: "inventory:view"
      },
      {
        path: "/vendor-management",
        icon: "fas fa-handshake",
        label: t('nav.vendorManagement'),
        permission: "vendors:view"
      },
      {
        path: "/user-management",
        icon: "fas fa-users-cog",
        label: t('nav.userManagement'),
        roles: ["admin", "superadmin"]
      },
      {
        path: "/role-permission-management",
        icon: "fas fa-shield-alt",
        label: "Role & Permissions",
        roles: ["superadmin"]
      },
      {
        path: "/system-settings",
        icon: "fas fa-cogs",
        label: t('nav.systemSettings'),
        roles: ["admin", "superadmin"]
      },
      {
        path: "/integrations",
        icon: "fas fa-plug",
        label: t('nav.integrations'),
        permission: "integrations:view"
      }
    ];

  const visibleItems = navigationItems.filter(item => {
      // Role-based items (for special pages like user management)
      if (item.roles) {
        return item.roles.includes(user?.role || '');
      }

      // Customer-only items
      if (item.customerOnly) {
        return user?.role === 'customer';
      }

      // Permission-based items
      if (item.permission) {
        return hasPermission(item.permission);
      }

      return false;
    });

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-gold';
      case 'admin': return 'bg-primary';
      case 'staff': return 'bg-success';
      case 'customer': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="sidebar bg-dark text-white" style={{ width: "250px", minHeight: "100vh" }}>
      <div className="p-3 border-bottom border-secondary">
        <h5 className="mb-0">
          <i className="fas fa-store me-2"></i>
          ShopifyApp
        </h5>
      </div>

      {/* User Info */}
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
            <i className="fas fa-user text-white"></i>
          </div>
          <div className="flex-grow-1">
            <div className="small fw-bold">{user?.name}</div>
            <div className="d-flex align-items-center">
              <span className={`badge ${getRoleBadgeClass(user?.role || '')} me-2`} style={{ fontSize: '10px' }}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-3">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`d-block px-3 py-2 text-decoration-none text-white sidebar-link ${
              isActive(item.path) ? "bg-primary" : ""
            }`}
          >
            <i className={`${item.icon} me-2`}></i>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Language Switcher */}
      <div className="p-3 border-top border-secondary">
        <LanguageSwitcher />
      </div>

      {/* Logout Button */}
      <div className="p-3">
        <button
          onClick={logout}
          className="btn btn-outline-light btn-sm w-100"
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;