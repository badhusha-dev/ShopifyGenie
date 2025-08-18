import TopNav from "../components/TopNav";
import Dashboard from "../components/Dashboard";
import InventoryTable from "../components/InventoryTable";
import CustomerTable from "../components/CustomerTable";
import SubscriptionList from "../components/SubscriptionList";
import RoleSwitcher from "../components/RoleSwitcher";
import RoleBasedAccess from "../components/RoleBasedAccess";
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

        {/* Feature Sections */}
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-user-circle text-primary fs-4"></i>
                  </div>
                  <h5 className="mb-0">Customer Portal</h5>
                </div>
                <p className="text-muted mb-3">
                  Personal dashboard for customers to manage orders, loyalty points, and subscriptions.
                </p>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Complete order history and tracking
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Loyalty points management and redemption
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Subscription control and preferences
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Personalized rewards and offers
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-success">Enhanced Experience</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-robot text-info fs-4"></i>
                  </div>
                  <h5 className="mb-0">AI Insights</h5>
                </div>
                <p className="text-muted mb-3">
                  Leverage AI for deep business insights, trend analysis, and data-driven decision making.
                </p>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Identify key sales trends and patterns
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Analyze customer behavior and segmentation
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Forecast future sales and demand
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Uncover hidden growth opportunities
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-info">Data Driven</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-boxes text-warning fs-4"></i>
                  </div>
                  <h5 className="mb-0">Advanced Inventory</h5>
                </div>
                <p className="text-muted mb-3">
                  Professional-grade inventory management with batch tracking and expiry monitoring.
                </p>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    FIFO batch tracking with expiry dates
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Predictive stock-out analytics
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Multi-warehouse management
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Complete audit trail and reporting
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-warning text-dark">Enterprise</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-handshake text-success fs-4"></i>
                  </div>
                  <h5 className="mb-0">Vendor Management</h5>
                </div>
                <p className="text-muted mb-3">
                  Complete supplier relationship management with purchase orders and performance tracking.
                </p>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Comprehensive vendor database
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Purchase order automation
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Payment tracking and management
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Vendor performance analytics
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-success">Supply Chain</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i className="fas fa-lightbulb text-primary fs-4"></i>
                  </div>
                  <h5 className="mb-0">AI Recommendations</h5>
                </div>
                <p className="text-muted mb-3">
                  Intelligent product recommendations and business insights powered by machine learning.
                </p>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Personalized product suggestions
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Sales forecasting with 85%+ accuracy
                  </small>
                </div>
                <div className="mb-2">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Customer behavior analysis
                  </small>
                </div>
                <div className="mb-3">
                  <small className="text-success">
                    <i className="fas fa-check me-1"></i>
                    Automated marketing insights
                  </small>
                </div>
                <div className="text-end">
                  <span className="badge bg-primary">AI Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>


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

            {/* Role Demo */}
            <div className="mt-3">
              <RoleSwitcher />
            </div>
          </div>
        </div>

        {/* AI Insights & Abandoned Carts */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-brain me-2"></i>
                  AI Sales Forecast
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-primary">$12,450</h4>
                    <small className="text-muted">Next 7 Days</small>
                  </div>
                  <div className="col-6">
                    <h4 className="text-success">$35,200</h4>
                    <small className="text-muted">Next 30 Days</small>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small">Confidence Level</span>
                    <span className="badge bg-success">87%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="fas fa-shopping-cart me-2"></i>
                  Abandoned Carts Recovery
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <h5 className="text-warning">23</h5>
                    <small className="text-muted">Active Carts</small>
                  </div>
                  <div className="col-4">
                    <h5 className="text-success">$2,340</h5>
                    <small className="text-muted">Potential Revenue</small>
                  </div>
                  <div className="col-4">
                    <h5 className="text-info">34%</h5>
                    <small className="text-muted">Recovery Rate</small>
                  </div>
                </div>
                <button className="btn btn-warning btn-sm w-100 mt-3">
                  <i className="fas fa-envelope me-2"></i>
                  Send Recovery Emails
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Tiers Overview */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-medal me-2"></i>
                  Loyalty Tier Distribution
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center">
                    <div className="p-3 border rounded mb-3" style={{ borderColor: '#CD7F32' }}>
                      <i className="fas fa-medal fa-2x mb-2" style={{ color: '#CD7F32' }}></i>
                      <h5>Bronze</h5>
                      <h3 className="text-muted">45</h3>
                      <small>0-999 points</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="p-3 border rounded mb-3" style={{ borderColor: '#C0C0C0' }}>
                      <i className="fas fa-award fa-2x mb-2" style={{ color: '#C0C0C0' }}></i>
                      <h5>Silver</h5>
                      <h3 className="text-muted">23</h3>
                      <small>1000-2499 points</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="p-3 border rounded mb-3" style={{ borderColor: '#FFD700' }}>
                      <i className="fas fa-crown fa-2x mb-2" style={{ color: '#FFD700' }}></i>
                      <h5>Gold</h5>
                      <h3 className="text-muted">12</h3>
                      <small>2500-4999 points</small>
                    </div>
                  </div>
                  <div className="col-md-3 text-center">
                    <div className="p-3 border rounded mb-3" style={{ borderColor: '#E5E4E2' }}>
                      <i className="fas fa-gem fa-2x mb-2" style={{ color: '#E5E4E2' }}></i>
                      <h5>Platinum</h5>
                      <h3 className="text-muted">7</h3>
                      <small>5000+ points</small>
                    </div>
                  </div>
                </div>
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

        {/* Shopify Integration */}
        <div className="row mb-4">
          <div className="col-12">
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