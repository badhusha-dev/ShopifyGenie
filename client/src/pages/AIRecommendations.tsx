
import TopNav from "../components/TopNav";
import { useQuery } from "@tanstack/react-query";
import type { Customer, Product } from "@shared/schema";

interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  product: Product;
}

const AIRecommendations = () => {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: recommendations } = useQuery<ProductRecommendation[]>({
    queryKey: ["/api/ai/recommendations", customers?.[0]?.id],
    enabled: !!customers?.[0]?.id,
  });

  const { data: forecast } = useQuery({
    queryKey: ["/api/ai/sales-forecast"],
    queryFn: () => fetch("/api/ai/sales-forecast?days=30").then(res => res.json()),
  });

  const { data: tierDistribution } = useQuery({
    queryKey: ["/api/loyalty/tier-distribution"],
  });

  return (
    <>
      <TopNav
        title="AI-Powered Insights"
        subtitle="Intelligent recommendations and predictive analytics"
      />
      <div className="content-wrapper">
        {/* AI Sales Forecast */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  AI Sales Forecast (Next 30 Days)
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <h2 className="text-primary">${forecast?.forecast?.toLocaleString() || '0'}</h2>
                    <p className="text-muted mb-0">Predicted Revenue</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <h2 className="text-success">{forecast?.confidence || 0}%</h2>
                    <p className="text-muted mb-0">Confidence Level</p>
                  </div>
                  <div className="col-md-4 text-center">
                    <h2 className="text-info">${forecast?.dailyAverage?.toLocaleString() || '0'}</h2>
                    <p className="text-muted mb-0">Daily Average</p>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-12">
                    <h6>Trend Analysis</h6>
                    <div className="d-flex justify-content-between">
                      <span className="badge bg-success">Growth: {forecast?.trends?.growth || '+0%'}</span>
                      <span className="badge bg-info">Seasonal: {forecast?.trends?.seasonal || '+0%'}</span>
                      <span className="badge bg-primary">Overall: {forecast?.trends?.overall || 'stable'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <i className="fas fa-lightbulb me-2"></i>
                  AI Insights
                </h6>
              </div>
              <div className="card-body">
                <div className="alert alert-info" role="alert">
                  <small>
                    <strong>Peak Hours:</strong> 2-4 PM shows highest conversion
                  </small>
                </div>
                <div className="alert alert-success" role="alert">
                  <small>
                    <strong>Top Category:</strong> Health & Wellness trending up 23%
                  </small>
                </div>
                <div className="alert alert-warning" role="alert">
                  <small>
                    <strong>Inventory Alert:</strong> Restock "Organic Green Tea" soon
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Recommendations */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-robot me-2"></i>
                  AI Product Recommendations
                  {customers?.[0] && (
                    <span className="text-muted"> - for {customers[0].name}</span>
                  )}
                </h6>
              </div>
              <div className="card-body">
                {recommendations && recommendations.length > 0 ? (
                  <div className="row">
                    {recommendations.map((rec) => (
                      <div key={rec.productId} className="col-md-4 mb-3">
                        <div className="card border">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title">{rec.product.name}</h6>
                              <span className="badge bg-primary">
                                {Math.round(rec.score * 100)}% match
                              </span>
                            </div>
                            <p className="card-text">
                              <strong>${rec.product.price}</strong>
                              <br />
                              <small className="text-muted">{rec.product.category}</small>
                            </p>
                            <div className="mb-2">
                              <small className="text-info">
                                <i className="fas fa-info-circle me-1"></i>
                                {rec.reason}
                              </small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Stock: {rec.product.stock}
                              </small>
                              <button className="btn btn-sm btn-outline-primary">
                                <i className="fas fa-paper-plane me-1"></i>
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-robot fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Recommendations Available</h5>
                    <p className="text-muted">Add more customer purchase data to generate AI recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Tier Distribution */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Customer Tier Distribution
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  {tierDistribution?.map((tier: any) => (
                    <div key={tier.tier} className="col-md-3 text-center">
                      <div className="p-3 border rounded" style={{ borderColor: tier.color }}>
                        <h4 style={{ color: tier.color }}>{tier.count}</h4>
                        <h6>{tier.tier} Tier</h6>
                        <div className="progress mt-2" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${(tier.count / (customers?.length || 1)) * 100}%`,
                              backgroundColor: tier.color 
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">
                          {Math.round((tier.count / (customers?.length || 1)) * 100)}% of customers
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Center */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h6 className="mb-0">
                  <i className="fas fa-cogs me-2"></i>
                  AI Action Center
                </h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <button className="btn btn-outline-primary w-100 mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      Send Personalized Emails
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-success w-100 mb-2">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Process Abandoned Carts
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-warning w-100 mb-2">
                      <i className="fas fa-chart-bar me-2"></i>
                      Generate Reports
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-outline-info w-100 mb-2">
                      <i className="fas fa-sync me-2"></i>
                      Sync AI Models
                    </button>
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

export default AIRecommendations;
