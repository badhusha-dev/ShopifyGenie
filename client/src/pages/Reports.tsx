import TopNav from "../components/TopNav";
import { useQuery } from "@tanstack/react-query";

const Reports = () => {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  return (
    <>
      <TopNav
        title="Reports & Analytics"
        subtitle="View comprehensive analytics and business insights"
      />
      <div className="content-wrapper">
        {/* Key Metrics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">${stats?.totalSales?.toFixed(2) || "0.00"}</h3>
                <p className="mb-0">Total Sales</p>
                <small className="text-muted">All time</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{stats?.totalOrders || 0}</h3>
                <p className="mb-0">Total Orders</p>
                <small className="text-muted">All time</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">${stats?.avgOrderValue?.toFixed(2) || "0.00"}</h3>
                <p className="mb-0">Avg Order Value</p>
                <small className="text-muted">All time</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{stats?.totalProducts || 0}</h3>
                <p className="mb-0">Products</p>
                <small className="text-muted">In catalog</small>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Sales Trend</h6>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Sales Chart Coming Soon</h5>
                  <p className="text-muted">Integration with charting library needed</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Top Products</h6>
              </div>
              <div className="card-body">
                <div className="text-center py-4">
                  <i className="fas fa-trophy fa-2x text-muted mb-3"></i>
                  <p className="text-muted">No sales data available yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Actions */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Generate Reports</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Report Type</label>
                  <select className="form-select">
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="loyalty">Loyalty Report</option>
                    <option value="customers">Customer Report</option>
                  </select>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
                <div className="mt-3">
                  <button className="btn btn-primary w-100">
                    <i className="fas fa-file-download me-2"></i>
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Quick Insights</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Inventory Value:</span>
                  <strong className="text-success">$0.00</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Low Stock Items:</span>
                  <strong className="text-warning">{stats?.lowStockItems || 0}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Active Subscriptions:</span>
                  <strong className="text-info">{stats?.activeSubscriptions || 0}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Loyalty Points Outstanding:</span>
                  <strong className="text-primary">{stats?.totalLoyaltyPoints || 0}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2">
                  <span>Conversion Rate:</span>
                  <strong className="text-secondary">N/A</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopify Integration Status */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Integration Health</h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <i className="fas fa-circle text-success mb-2"></i>
                      <h6>Shopify API</h6>
                      <small className="text-muted">Connected</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <i className="fas fa-circle text-success mb-2"></i>
                      <h6>Webhooks</h6>
                      <small className="text-muted">Active</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <i className="fas fa-circle text-warning mb-2"></i>
                      <h6>Sync Status</h6>
                      <small className="text-muted">Ready</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <i className="fas fa-circle text-success mb-2"></i>
                      <h6>Data Health</h6>
                      <small className="text-muted">Good</small>
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

export default Reports;
