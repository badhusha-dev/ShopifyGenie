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
    { path: "/ai-recommendations", label: "AI Insights", icon: "fas fa-robot" }, // Added AI Insights
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
          <li>
            <Link href="/ai-recommendations" className="nav-link">
              <i className="fas fa-robot me-2"></i>
              AI Recommendations
            </Link>
          </li>
          <li>
            <Link href="/advanced-inventory" className="nav-link">
              <i className="fas fa-warehouse me-2"></i>
              Advanced Inventory
            </Link>
          </li>
          <li>
            <Link href="/vendor-management" className="nav-link">
              <i className="fas fa-truck me-2"></i>
              Vendor Management
            </Link>
          </li>
      </ul>
    </nav>
  );
};

export default Sidebar;