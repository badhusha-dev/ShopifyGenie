import { Link, useLocation } from "wouter";

const Sidebar = () => {
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { path: "/inventory", label: "Inventory", icon: "fas fa-boxes" },
    { path: "/loyalty", label: "Loyalty Points", icon: "fas fa-star" },
    { path: "/subscriptions", label: "Subscriptions", icon: "fas fa-sync-alt" },
    { path: "/customers", label: "Customers", icon: "fas fa-users" },
    { path: "/reports", label: "Reports", icon: "fas fa-chart-bar" },
    { path: "/portal", label: "Customer Portal", icon: "fas fa-user-circle" },
  ];

  return (
    <nav className="sidebar">
      <div className="brand">
        <h4 className="text-white mb-0">
          <i className="fas fa-cube me-2"></i>
          ShopifyApp
        </h4>
        <small className="text-white-50">Inventory & Loyalty</small>
      </div>
      <ul className="nav flex-column">
        {navigationItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              href={item.path}
              className={`nav-link ${location === item.path ? "active" : ""}`}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
