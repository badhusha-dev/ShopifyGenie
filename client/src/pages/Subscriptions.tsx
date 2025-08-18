import TopNav from "../components/TopNav";
import SubscriptionList from "../components/SubscriptionList";
import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@shared/schema";

const Subscriptions = () => {
  const { data: subscriptions } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
  const pausedSubscriptions = subscriptions?.filter(s => s.status === 'paused').length || 0;
  const cancelledSubscriptions = subscriptions?.filter(s => s.status === 'cancelled').length || 0;

  return (
    <>
      <TopNav
        title="Subscription Management"
        subtitle="Manage customer subscriptions and recurring orders"
      />
      <div className="content-wrapper">
        {/* Subscription Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">{activeSubscriptions}</h3>
                <p className="mb-0">Active Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{pausedSubscriptions}</h3>
                <p className="mb-0">Paused Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-danger">{cancelledSubscriptions}</h3>
                <p className="mb-0">Cancelled Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">{subscriptions?.length || 0}</h3>
                <p className="mb-0">Total Subscriptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="row mb-4">
          <div className="col-md-8">
            <SubscriptionList />
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Subscription Settings</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Default Frequency</label>
                  <select className="form-select" defaultValue="monthly">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Auto-renewal</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="autoRenewal" defaultChecked />
                    <label className="form-check-label" htmlFor="autoRenewal">
                      Enable auto-renewal by default
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Discount for Subscriptions (%)</label>
                  <input type="number" className="form-control" defaultValue="10" />
                </div>
                <button className="btn btn-primary w-100">Update Settings</button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deliveries */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Upcoming Deliveries</h6>
              </div>
              <div className="card-body">
                {subscriptions?.filter(s => s.status === 'active').length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No upcoming deliveries</h5>
                    <p className="text-muted">No active subscriptions found</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Frequency</th>
                          <th>Next Delivery</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions?.filter(s => s.status === 'active').map((subscription) => (
                          <tr key={subscription.id}>
                            <td>Customer Name</td>
                            <td>Product Name</td>
                            <td>
                              <span className="badge bg-secondary">{subscription.frequency}</span>
                            </td>
                            <td>
                              {subscription.nextDelivery 
                                ? new Date(subscription.nextDelivery).toLocaleDateString()
                                : 'N/A'
                              }
                            </td>
                            <td>
                              <span className="badge bg-success">{subscription.status}</span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-outline-warning">
                                  <i className="fas fa-pause"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscriptions;
