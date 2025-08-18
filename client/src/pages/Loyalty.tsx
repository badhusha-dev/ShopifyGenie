import TopNav from "../components/TopNav";
import { useQuery } from "@tanstack/react-query";
import type { Customer, LoyaltyTransaction } from "@shared/schema";

const Loyalty = () => {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: transactions } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["/api/loyalty/transactions"],
  });

  const totalPoints = customers?.reduce((sum, customer) => sum + customer.loyaltyPoints, 0) || 0;
  const totalRedeemed = transactions?.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + t.points, 0) || 0;

  return (
    <>
      <TopNav
        title="Loyalty Points Management"
        subtitle="Manage customer loyalty points and rewards program"
      />
      <div className="content-wrapper">
        {/* Loyalty Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">{totalPoints}</h3>
                <p className="mb-0">Total Points Issued</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{totalRedeemed}</h3>
                <p className="mb-0">Points Redeemed</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">{customers?.length || 0}</h3>
                <p className="mb-0">Active Members</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{totalPoints - totalRedeemed}</h3>
                <p className="mb-0">Available Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Settings */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Loyalty Program Settings</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Points per Dollar Spent</label>
                  <input type="number" className="form-control" value="1" readOnly />
                  <small className="text-muted">Customers earn 1 point for every $1 spent</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Point Value (USD)</label>
                  <input type="number" className="form-control" value="0.01" readOnly />
                  <small className="text-muted">Each point is worth $0.01</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Redemption</label>
                  <input type="number" className="form-control" value="100" readOnly />
                  <small className="text-muted">Minimum 100 points required for redemption</small>
                </div>
                <button className="btn btn-primary">Update Settings</button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Quick Actions</h6>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    <i className="fas fa-gift me-2"></i>
                    Award Bonus Points
                  </button>
                  <button className="btn btn-outline-info">
                    <i className="fas fa-download me-2"></i>
                    Export Loyalty Data
                  </button>
                  <button className="btn btn-outline-success">
                    <i className="fas fa-envelope me-2"></i>
                    Send Points Summary
                  </button>
                  <button className="btn btn-outline-warning">
                    <i className="fas fa-chart-line me-2"></i>
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Points Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Customer Points Balance</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Customer</th>
                        <th>Current Points</th>
                        <th>Total Earned</th>
                        <th>Total Spent</th>
                        <th>Join Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers?.map((customer) => (
                        <tr key={customer.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{customer.name}</div>
                              <small className="text-muted">{customer.email}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info fs-6">{customer.loyaltyPoints} pts</span>
                          </td>
                          <td>{customer.loyaltyPoints}</td>
                          <td>${customer.totalSpent}</td>
                          <td>{new Date(customer.createdAt || '').toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary">
                                <i className="fas fa-gift"></i>
                              </button>
                              <button className="btn btn-outline-info">
                                <i className="fas fa-history"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loyalty;
