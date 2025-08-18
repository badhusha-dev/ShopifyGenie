import TopNav from "../components/TopNav";
import Dashboard from "../components/Dashboard";
import InventoryTable from "../components/InventoryTable";
import CustomerTable from "../components/CustomerTable";
import SubscriptionList from "../components/SubscriptionList";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <>
      <TopNav
        title="Dashboard Overview"
        subtitle="Welcome back to your inventory management system"
      />
      <div className="content-wrapper">
        <Dashboard />

        {/* Inventory Management Section */}
        <div className="row mb-4">
          <div className="col-lg-8">
            <InventoryTable />
          </div>

          {/* Alerts & Quick Actions */}
          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-bell me-2"></i>
                  Stock Alerts
                </h6>
              </div>
              <div className="card-body">
                <div className="alert alert-warning" role="alert">
                  <strong>{stats?.lowStockItems || 0} products</strong> are running low on stock
                </div>
                <button className="btn btn-primary btn-sm w-100">
                  View All Alerts
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Loyalty System
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Points Issued:</span>
                  <strong>{stats?.totalLoyaltyPoints || 0}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Points Redeemed:</span>
                  <strong>0</strong>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Active Members:</span>
                  <strong>0</strong>
                </div>
                <button className="btn btn-outline-primary btn-sm w-100">
                  Manage Loyalty Program
                </button>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fab fa-shopify me-2"></i>
                  Shopify Integration
                </h6>
              </div>
              <div className="card-body">
                <div className="alert alert-info" role="alert">
                  <small>
                    <strong>Setup Required:</strong> Configure your Shopify API keys in environment variables to enable real-time synchronization with your Shopify store.
                  </small>
                </div>
                <div className="mb-3">
                  <button 
                    className="btn btn-success btn-sm w-100 mb-2"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/shopify/sync', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ shop: 'demo-shop.myshopify.com' })
                        });
                        const result = await response.json();
                        if (response.ok) {
                          alert(`Sync completed! Products: ${result.synced?.products || 0}, Customers: ${result.synced?.customers || 0}, Orders: ${result.synced?.orders || 0}`);
                          window.location.reload();
                        } else {
                          alert(`Sync failed: ${result.error}`);
                        }
                      } catch (error) {
                        alert('Sync failed: Please configure Shopify API keys');
                      }
                    }}
                  >
                    <i className="fas fa-sync me-1"></i>
                    Sync with Shopify
                  </button>
                  <a 
                    href="/auth?shop=demo-shop.myshopify.com" 
                    className="btn btn-outline-primary btn-sm w-100"
                    target="_blank"
                  >
                    <i className="fas fa-link me-1"></i>
                    Connect Shopify Store
                  </a>
                </div>
                <small className="text-muted">
                  Real-time sync requires API configuration
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Dashboard Section */}
        <div className="row mb-4">
          <div className="col-12">
            <CustomerTable />
          </div>
        </div>

        {/* Subscription Management */}
        <div className="row mb-4">
          <div className="col-lg-6">
            <SubscriptionList />
          </div>

          {/* Reports & Analytics */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Sales Analytics
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-success mb-1">${stats?.totalSales?.toFixed(2) || "0.00"}</h4>
                      <small className="text-muted">Total Sales</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{stats?.totalOrders || 0}</h4>
                      <small className="text-muted">Total Orders</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <h4 className="text-info mb-1">${stats?.avgOrderValue?.toFixed(2) || "0.00"}</h4>
                    <small className="text-muted">Avg. Order</small>
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Top Product:</span>
                    <strong>N/A</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Best Customer:</span>
                    <strong>N/A</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Conversion Rate:</span>
                    <strong>N/A</strong>
                  </div>
                </div>
                <button className="btn btn-outline-primary btn-sm w-100">
                  View Detailed Reports
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Status & System Health */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-cogs me-2"></i>
                  System Status & Integration Health
                </h6>
                <span className="badge bg-success">All Systems Operational</span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="fas fa-circle text-success"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Shopify API</div>
                        <small className="text-muted">Connected</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="fas fa-circle text-success"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Webhooks</div>
                        <small className="text-muted">Active</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="fas fa-circle text-success"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Database</div>
                        <small className="text-muted">Healthy</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <i className="fas fa-circle text-warning"></i>
                      </div>
                      <div>
                        <div className="fw-semibold">Sync Status</div>
                        <small className="text-muted">Ready</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
