import { useState } from "react";
import TopNav from "../components/TopNav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CustomerPortal = () => {
  const [customerId, setCustomerId] = useState("5318f6d4-5206-4674-98e5-5b498ab0dd47"); // Mock customer ID
  const [redeemPoints, setRedeemPoints] = useState(0);

  const { data: portalData, isLoading } = useQuery({
    queryKey: ["/api/customer/portal", customerId],
    enabled: !!customerId,
  });

  const redeemMutation = useMutation({
    mutationFn: async (data: { customerId: string, points: number, description: string }) => {
      return apiRequest("/api/customer/redeem-points", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/portal", customerId] });
      setRedeemPoints(0);
      alert("Points redeemed successfully!");
    },
    onError: (error: any) => {
      alert(`Error: ${error.message || 'Failed to redeem points'}`);
    }
  });

  if (isLoading) {
    return (
      <>
        <TopNav title="Customer Portal" subtitle="Manage your loyalty points and orders" />
        <div className="content-wrapper">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your account...</p>
          </div>
        </div>
      </>
    );
  }

  const customer = portalData?.customer;
  const orders = portalData?.orders || [];
  const subscriptions = portalData?.subscriptions || [];
  const loyaltyTransactions = portalData?.loyaltyTransactions || [];

  return (
    <>
      <TopNav 
        title="Customer Portal" 
        subtitle={`Welcome back, ${customer?.name || 'Customer'}!`} 
      />
      <div className="content-wrapper">
        {/* Customer Info & Loyalty Points */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  Account Information
                </h6>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <i className="fas fa-user-circle fa-4x text-primary mb-2"></i>
                  <h5>{customer?.name}</h5>
                  <p className="text-muted">{customer?.email}</p>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Member Since:</span>
                  <strong>{new Date(customer?.createdAt || '').toLocaleDateString()}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total Spent:</span>
                  <strong>${customer?.totalSpent || '0.00'}</strong>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <i className="fas fa-star me-2"></i>
                  Loyalty Points
                </h6>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <h2 className="text-success">{customer?.loyaltyPoints || 0}</h2>
                  <p className="mb-0">Available Points</p>
                </div>
                <div className="row text-center">
                  <div className="col-6 border-end">
                    <h6 className="text-primary">{portalData?.totalEarned || 0}</h6>
                    <small className="text-muted">Total Earned</small>
                  </div>
                  <div className="col-6">
                    <h6 className="text-warning">{portalData?.totalRedeemed || 0}</h6>
                    <small className="text-muted">Total Redeemed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <i className="fas fa-gift me-2"></i>
                  Redeem Points
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Points to Redeem</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    max={customer?.loyaltyPoints || 0}
                    min={0}
                  />
                  <small className="text-muted">
                    {redeemPoints > 0 && `$${(redeemPoints * 0.01).toFixed(2)} discount value`}
                  </small>
                </div>
                <button 
                  className="btn btn-info w-100"
                  disabled={redeemPoints <= 0 || redeemPoints > (customer?.loyaltyPoints || 0) || redeemMutation.isPending}
                  onClick={() => redeemMutation.mutate({
                    customerId,
                    points: redeemPoints,
                    description: `Redeemed ${redeemPoints} points for $${(redeemPoints * 0.01).toFixed(2)} discount`
                  })}
                >
                  {redeemMutation.isPending ? (
                    <span>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Redeeming...
                    </span>
                  ) : (
                    <span>
                      <i className="fas fa-gift me-2"></i>
                      Redeem Points
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-shopping-bag me-2"></i>
                  Recent Orders
                </h6>
              </div>
              <div className="card-body">
                {orders.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Orders Yet</h5>
                    <p className="text-muted">Start shopping to see your orders here!</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Total</th>
                          <th>Points Earned</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order: any) => (
                          <tr key={order.id}>
                            <td>#{order.id.substring(0, 8)}</td>
                            <td>${parseFloat(order.total).toFixed(2)}</td>
                            <td>
                              <span className="badge bg-success">{order.pointsEarned} pts</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                order.status === 'paid' ? 'bg-success' : 
                                order.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Activity
                </h6>
              </div>
              <div className="card-body">
                {loyaltyTransactions.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-star fa-2x text-muted mb-3"></i>
                    <p className="text-muted">No loyalty activity yet</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {loyaltyTransactions.slice(0, 5).map((transaction: any) => (
                      <div key={transaction.id} className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <small className="text-muted d-block">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </small>
                          <span className="small">
                            {transaction.description || 
                             (transaction.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}
                          </span>
                        </div>
                        <span className={`badge ${
                          transaction.type === 'earned' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {transaction.type === 'earned' ? '+' : ''}{transaction.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-sync me-2"></i>
                    My Subscriptions
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    {subscriptions.map((subscription: any) => (
                      <div key={subscription.id} className="col-md-4 mb-3">
                        <div className="card border">
                          <div className="card-body">
                            <h6 className="card-title">{subscription.planName}</h6>
                            <p className="card-text">
                              <strong>${subscription.price}</strong> / {subscription.interval}
                            </p>
                            <div className="mb-2">
                              <span className={`badge ${
                                subscription.status === 'active' ? 'bg-success' : 
                                subscription.status === 'paused' ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {subscription.status}
                              </span>
                            </div>
                            <small className="text-muted">
                              Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                            </small>
                            <div className="mt-3">
                              <button className="btn btn-sm btn-outline-warning me-2">
                                <i className="fas fa-pause me-1"></i>Pause
                              </button>
                              <button className="btn btn-sm btn-outline-danger">
                                <i className="fas fa-times me-1"></i>Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default CustomerPortal;