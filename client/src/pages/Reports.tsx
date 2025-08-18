import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import TopNav from "../components/TopNav";

interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

interface TopProduct {
  name: string;
  sales: number;
  quantity: number;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  avgOrderValue: number;
  retentionRate: number;
}

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: salesTrends } = useQuery<SalesTrend[]>({
    queryKey: ["/api/analytics/sales-trends", selectedPeriod],
  });

  const { data: topProducts } = useQuery<TopProduct[]>({
    queryKey: ["/api/analytics/top-products", selectedPeriod],
  });

  const { data: loyaltyAnalytics } = useQuery({
    queryKey: ["/api/analytics/loyalty-points"],
  });

  const { data: forecast } = useQuery({
    queryKey: ["/api/ai/sales-forecast", { days: 30 }],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  // Calculate key metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const totalCustomers = customers?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;

  // Calculate period metrics
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - parseInt(selectedPeriod));

  const periodOrders = orders?.filter(order => 
    new Date(order.createdAt) >= periodStart
  ) || [];

  const periodRevenue = periodOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const periodCustomers = customers?.filter(customer => 
    new Date(customer.createdAt) >= periodStart
  ).length || 0;

  return (
    <>
      <TopNav title="Reports & Analytics" subtitle="Business insights and performance metrics" />
      <div className="content-wrapper">
        {/* Period Selector */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-group">
            <button
              className={`btn ${selectedPeriod === "7" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedPeriod("7")}
            >
              Last 7 Days
            </button>
            <button
              className={`btn ${selectedPeriod === "30" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedPeriod("30")}
            >
              Last 30 Days
            </button>
            <button
              className={`btn ${selectedPeriod === "90" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setSelectedPeriod("90")}
            >
              Last 90 Days
            </button>
          </div>
          <button className="btn btn-success">
            <i className="fas fa-download me-2"></i>
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">${periodRevenue.toFixed(2)}</h3>
                <p className="mb-0">Revenue ({selectedPeriod} days)</p>
                <small className="text-muted">Total: ${totalRevenue.toFixed(2)}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{periodOrders.length}</h3>
                <p className="mb-0">Orders ({selectedPeriod} days)</p>
                <small className="text-muted">Total: {totalOrders}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">{periodCustomers}</h3>
                <p className="mb-0">New Customers</p>
                <small className="text-muted">Total: {totalCustomers}</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">${avgOrderValue.toFixed(2)}</h3>
                <p className="mb-0">Avg Order Value</p>
                <small className="text-muted">{activeSubscriptions} subscriptions</small>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-chart-line me-2"></i>
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "products" ? "active" : ""}`}
              onClick={() => setActiveTab("products")}
            >
              <i className="fas fa-box me-2"></i>
              Products
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "customers" ? "active" : ""}`}
              onClick={() => setActiveTab("customers")}
            >
              <i className="fas fa-users me-2"></i>
              Customers
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "forecast" ? "active" : ""}`}
              onClick={() => setActiveTab("forecast")}
            >
              <i className="fas fa-crystal-ball me-2"></i>
              Forecast
            </button>
          </li>
        </ul>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Sales Trends</h6>
                </div>
                <div className="card-body">
                  <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="text-center">
                      <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                      <p className="text-muted">Sales trend chart would be displayed here</p>
                      <small>Revenue: ${periodRevenue.toFixed(2)} | Orders: {periodOrders.length}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Order Status Distribution</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Completed</span>
                      <span>{orders?.filter(o => o.status === "paid").length || 0}</span>
                    </div>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${((orders?.filter(o => o.status === "paid").length || 0) / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Pending</span>
                      <span>{orders?.filter(o => o.status === "pending").length || 0}</span>
                    </div>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-warning"
                        style={{ width: `${((orders?.filter(o => o.status === "pending").length || 0) / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Cancelled</span>
                      <span>{orders?.filter(o => o.status === "cancelled").length || 0}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${((orders?.filter(o => o.status === "cancelled").length || 0) / totalOrders) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Top Selling Products</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Stock</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products?.slice(0, 10).map((product) => (
                          <tr key={product.id}>
                            <td>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">{product.sku}</small>
                            </td>
                            <td>{product.category}</td>
                            <td>
                              <span className={`badge ${product.stock < 10 ? "bg-danger" : "bg-success"}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td>${parseFloat(product.price || "0").toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Inventory Status</h6>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-4">
                      <h4 className="text-success">{products?.filter(p => p.stock > 20).length || 0}</h4>
                      <small>Well Stocked</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-warning">{products?.filter(p => p.stock > 0 && p.stock <= 20).length || 0}</h4>
                      <small>Low Stock</small>
                    </div>
                    <div className="col-4">
                      <h4 className="text-danger">{products?.filter(p => p.stock === 0).length || 0}</h4>
                      <small>Out of Stock</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card mt-3">
                <div className="card-header">
                  <h6 className="mb-0">Category Performance</h6>
                </div>
                <div className="card-body">
                  {["Electronics", "Clothing", "Books", "Home & Garden"].map(category => {
                    const categoryProducts = products?.filter(p => p.category === category) || [];
                    return (
                      <div key={category} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>{category}</span>
                          <span>{categoryProducts.length} products</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            style={{ width: `${(categoryProducts.length / (products?.length || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Customer Segments</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>VIP Customers ($100+ spent)</span>
                      <span>{customers?.filter(c => parseFloat(c.totalSpent || "0") >= 100).length || 0}</span>
                    </div>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-gold"
                        style={{ width: `${((customers?.filter(c => parseFloat(c.totalSpent || "0") >= 100).length || 0) / totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>Regular Customers ($10-$99)</span>
                      <span>{customers?.filter(c => {
                        const spent = parseFloat(c.totalSpent || "0");
                        return spent >= 10 && spent < 100;
                      }).length || 0}</span>
                    </div>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${((customers?.filter(c => {
                          const spent = parseFloat(c.totalSpent || "0");
                          return spent >= 10 && spent < 100;
                        }).length || 0) / totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span>New Customers (&lt; $10)</span>
                      <span>{customers?.filter(c => parseFloat(c.totalSpent || "0") < 10).length || 0}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: `${((customers?.filter(c => parseFloat(c.totalSpent || "0") < 10).length || 0) / totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Loyalty Program Stats</h6>
                </div>
                <div className="card-body">
                  <div className="row text-center mb-3">
                    <div className="col-6">
                      <h4 className="text-primary">{customers?.reduce((sum, c) => sum + c.loyaltyPoints, 0).toLocaleString() || 0}</h4>
                      <small>Total Points Issued</small>
                    </div>
                    <div className="col-6">
                      <h4 className="text-success">{customers?.filter(c => c.loyaltyPoints > 0).length || 0}</h4>
                      <small>Active Members</small>
                    </div>
                  </div>
                  <h6>Top Loyalty Members</h6>
                  {customers?.sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 5).map((customer) => (
                    <div key={customer.id} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{customer.name}</strong>
                        <br />
                        <small className="text-muted">{customer.email}</small>
                      </div>
                      <span className="badge bg-primary">{customer.loyaltyPoints}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Tab */}
        {activeTab === "forecast" && (
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">AI Sales Forecast (30 Days)</h6>
                </div>
                <div className="card-body">
                  {forecast ? (
                    <div>
                      <div className="row text-center mb-4">
                        <div className="col-4">
                          <h3 className="text-success">${forecast.forecast}</h3>
                          <p className="mb-0">Projected Revenue</p>
                        </div>
                        <div className="col-4">
                          <h3 className="text-info">{forecast.confidence}%</h3>
                          <p className="mb-0">Confidence</p>
                        </div>
                        <div className="col-4">
                          <h3 className="text-primary">${forecast.dailyAverage}</h3>
                          <p className="mb-0">Daily Average</p>
                        </div>
                      </div>
                      <div className="alert alert-info">
                        <strong>Forecast Analysis:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Growth trend: {forecast.trends?.growth}</li>
                          <li>Seasonal factor: {forecast.trends?.seasonal}</li>
                          <li>Overall outlook: {forecast.trends?.overall}</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-chart-area fa-3x text-muted mb-3"></i>
                      <p className="text-muted">AI forecast chart would be displayed here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Key Recommendations</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    <strong>Low Stock Alert</strong>
                    <p className="small mb-0">
                      {products?.filter(p => p.stock < 10).length || 0} products need restocking
                    </p>
                  </div>
                  <div className="mb-3">
                    <i className="fas fa-star text-success me-2"></i>
                    <strong>Loyalty Opportunity</strong>
                    <p className="small mb-0">
                      {customers?.filter(c => c.loyaltyPoints === 0).length || 0} customers haven't earned points yet
                    </p>
                  </div>
                  <div className="mb-3">
                    <i className="fas fa-sync-alt text-info me-2"></i>
                    <strong>Subscription Growth</strong>
                    <p className="small mb-0">
                      Consider promoting subscriptions to regular customers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;