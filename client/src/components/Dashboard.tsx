import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="row mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-lg-3 col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row mb-4">
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card stats-card">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h3 className="mb-1">{stats?.totalProducts || 0}</h3>
                <p className="mb-0">Total Products</p>
              </div>
              <i className="fas fa-box fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-warning text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h3 className="mb-1">{stats?.lowStockItems || 0}</h3>
                <p className="mb-0">Low Stock Alert</p>
              </div>
              <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-info text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h3 className="mb-1">{stats?.totalLoyaltyPoints || 0}</h3>
                <p className="mb-0">Points Issued</p>
              </div>
              <i className="fas fa-star fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-6 mb-3">
        <div className="card bg-success text-white">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h3 className="mb-1">{stats?.activeSubscriptions || 0}</h3>
                <p className="mb-0">Active Subscriptions</p>
              </div>
              <i className="fas fa-sync-alt fa-2x opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
