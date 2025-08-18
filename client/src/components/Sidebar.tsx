import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location === path;

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        path: "/",
        icon: "fas fa-tachometer-alt",
        label: "Dashboard",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/inventory",
        icon: "fas fa-boxes",
        label: "Inventory",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/customers",
        icon: "fas fa-users",
        label: "Customers",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/subscriptions",
        icon: "fas fa-sync-alt",
        label: "Subscriptions",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/loyalty",
        icon: "fas fa-star",
        label: "Loyalty",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/reports",
        icon: "fas fa-chart-bar",
        label: "Reports",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/customer-portal",
        icon: "fas fa-user-circle",
        label: "Customer Portal",
        roles: ["customer"]
      },
      {
        path: "/advanced-inventory",
        icon: "fas fa-warehouse",
        label: "Advanced Inventory",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/ai-recommendations",
        icon: "fas fa-brain",
        label: "AI Recommendations",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/vendor-management",
        icon: "fas fa-truck",
        label: "Vendor Management",
        roles: ["admin", "staff", "superadmin"]
      },
      {
        path: "/user-management",
        icon: "fas fa-users-cog",
        label: "User Management",
        roles: ["admin", "superadmin"]
      }
    ];

    return baseItems.filter(item => item.roles.includes(user.role));
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-gold';
      case 'admin': return 'bg-primary';
      case 'staff': return 'bg-success';
      case 'customer': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const filteredItems = getMenuItems();

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
              {user?.role === 'admin' && <small className="ms-2 text-muted">(View Only)</small>}
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-3">
        {filteredItems.map((item) => (
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

      {/* Logout Button */}
      <div className="mt-auto p-3">
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