import { useState } from "react";
import TopNav from "../components/TopNav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

interface PortalData {
  customer: {
    id: string;
    name: string;
    email: string;
    loyaltyPoints: number;
    totalSpent: string;
    createdAt: string;
  };
  orders: Array<{
    id: string;
    total: string;
    status: string;
    pointsEarned: number;
    createdAt: string;
  }>;
  subscriptions: Array<{
    id: string;
    productName?: string;
    status: string;
    frequency: string;
    nextDelivery: string;
    createdAt: string;
  }>;
  loyaltyTransactions: Array<{
    id: string;
    points: number;
    type: string;
    description?: string;
    createdAt: string;
  }>;
  totalEarned: number;
  totalRedeemed: number;
}

const CustomerPortal = () => {
  const [customerId] = useState("customer-demo"); // In real app, get from auth
  const [activeTab, setActiveTab] = useState("overview");
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const { data: portalData, refetch } = useQuery<PortalData>({
    queryKey: [`/customer/portal/${customerId}`],
  });

  const redeemPointsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/customer/redeem-points", data),
    onSuccess: () => {
      setShowRedeemModal(false);
      refetch();
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/subscriptions/${data.id}`, data),
    onSuccess: () => refetch(),
  });

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const points = parseInt(formData.get("points") as string);
    const description = formData.get("description") as string;

    redeemPointsMutation.mutate({
      customerId,
      points,
      description,
    });
  };

  const handleSubscriptionAction = (subscriptionId: string, action: string) => {
    let status = '';
    let nextDelivery = '';
    
    switch (action) {
      case 'pause':
        status = 'paused';
        break;
      case 'resume':
        status = 'active';
        break;
      case 'cancel':
        status = 'cancelled';
        break;
      case 'skip':
        // Calculate next delivery date (add frequency interval)
        const currentSub = subscriptions.find(s => s.id === subscriptionId);
        if (currentSub) {
          const nextDate = new Date(currentSub.nextDelivery);
          if (currentSub.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          } else if (currentSub.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          }
          nextDelivery = nextDate.toISOString();
        }
        break;
    }

    subscriptionMutation.mutate({
      id: subscriptionId,
      status: status || undefined,
      nextDelivery: nextDelivery || undefined,
    });
  };

  if (!portalData) {
    return (
      <>
        <TopNav 
          title="Customer Portal" 
          subtitle="View your orders, loyalty points, and manage subscriptions"
        />
        <div className="content-wrapper">
          <div className="card">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading your account...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const { customer, orders, subscriptions, loyaltyTransactions, totalEarned, totalRedeemed } = portalData;

  return (
    <>
      <TopNav 
        title="Customer Portal" 
        subtitle="Your personal dashboard to manage orders, track loyalty rewards, and control subscriptions"
      />
      
      {/* Feature Explanation */}
      <div className="content-wrapper">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Welcome to Your Customer Portal</h5>
            <p className="mb-3">
              Your personal dashboard gives you complete control over your shopping experience. 
              Track your orders, manage loyalty points, and control your subscriptions all in one place.
            </p>
            
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary mb-2">What You Can Do:</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>View complete order history with real-time status updates</li>
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Track and redeem loyalty points for exclusive discounts</li>
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Manage subscription deliveries and frequencies</li>
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Monitor your spending patterns and savings</li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Access personalized rewards and member-only offers</li>
                  <li className="mb-2"><i className="fas fa-check text-success me-2"></i>Update delivery preferences and payment methods</li>
                </ul>
                <div className="mt-3">
                  <strong className="text-info">Benefit:</strong>
                  <p className="mb-0 small">Take full control of your shopping experience with instant access to everything you need, saving time and maximizing your rewards.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-wrapper">
        {/* Welcome Header */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h4 className="mb-1">Welcome back, {customer.name}!</h4>
                <p className="text-muted mb-0">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-md-4 text-end">
                <div className="d-flex justify-content-end align-items-center">
                  <div className="me-3 text-center">
                    <h3 className="text-primary mb-0">{customer.loyaltyPoints.toLocaleString()}</h3>
                    <small>Loyalty Points</small>
                  </div>
                  <button 
                    className="btn btn-warning"
                    onClick={() => setShowRedeemModal(true)}
                    disabled={customer.loyaltyPoints === 0}
                  >
                    <i className="fas fa-gift me-2"></i>
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">${parseFloat(customer.totalSpent || "0").toFixed(2)}</h3>
                <p className="mb-0">Total Spent</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{orders.length}</h3>
                <p className="mb-0">Orders Placed</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">{subscriptions.filter(s => s.status === "active").length}</h3>
                <p className="mb-0">Active Subscriptions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{totalEarned}</h3>
                <p className="mb-0">Points Earned</p>
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
              <i className="fas fa-tachometer-alt me-2"></i>
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Orders ({orders.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "subscriptions" ? "active" : ""}`}
              onClick={() => setActiveTab("subscriptions")}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Subscriptions ({subscriptions.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "loyalty" ? "active" : ""}`}
              onClick={() => setActiveTab("loyalty")}
            >
              <i className="fas fa-star me-2"></i>
              Loyalty Points
            </button>
          </li>
        </ul>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">Recent Orders</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>${parseFloat(order.total).toFixed(2)}</td>
                            <td>
                              <span className="badge bg-success">{order.status}</span>
                            </td>
                            <td>+{order.pointsEarned}</td>
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
                  <h6 className="mb-0">Loyalty Summary</h6>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Current Balance</span>
                    <span className="badge bg-primary fs-6">{customer.loyaltyPoints} points</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Total Earned</span>
                    <span className="text-success">+{totalEarned} points</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span>Total Redeemed</span>
                    <span className="text-danger">-{totalRedeemed} points</span>
                  </div>
                  <hr />
                  <div className="text-center">
                    <h6>Available Rewards</h6>
                    <div className="row">
                      <div className="col-6">
                        <div className="border rounded p-2 mb-2">
                          <small>$5 Off</small>
                          <br />
                          <strong>500 points</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="border rounded p-2 mb-2">
                          <small>$10 Off</small>
                          <br />
                          <strong>1000 points</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Order History</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Order Total</th>
                      <th>Status</th>
                      <th>Points Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <strong>${parseFloat(order.total).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className={`badge ${order.status === "paid" ? "bg-success" : "bg-warning"}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className="text-success">+{order.pointsEarned} points</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="row">
            {subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <div key={subscription.id} className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{subscription.productName || "Product Subscription"}</h6>
                      <span className={`badge ${
                        subscription.status === "active" ? "bg-success" : 
                        subscription.status === "paused" ? "bg-warning text-dark" : "bg-danger"
                      }`}>
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-6">
                          <small className="text-muted">Frequency</small>
                          <div className="fw-bold">{subscription.frequency}</div>
                        </div>
                        <div className="col-6">
                          <small className="text-muted">Next Delivery</small>
                          <div className="fw-bold">{new Date(subscription.nextDelivery).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted">Started</small>
                        <div>{new Date(subscription.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="d-flex gap-2">
                        {subscription.status === "active" && (
                          <button 
                            className="btn btn-sm btn-warning flex-fill"
                            onClick={() => handleSubscriptionAction(subscription.id, 'pause')}
                          >
                            <i className="fas fa-pause me-1"></i>
                            Pause
                          </button>
                        )}
                        {subscription.status === "paused" && (
                          <button 
                            className="btn btn-sm btn-success flex-fill"
                            onClick={() => handleSubscriptionAction(subscription.id, 'resume')}
                          >
                            <i className="fas fa-play me-1"></i>
                            Resume
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => handleSubscriptionAction(subscription.id, 'skip')}
                        >
                          <i className="fas fa-forward me-1"></i>
                          Skip Next
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger flex-fill"
                          onClick={() => handleSubscriptionAction(subscription.id, 'cancel')}
                        >
                          <i className="fas fa-times me-1"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-sync-alt fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Active Subscriptions</h5>
                    <p className="text-muted">You don't have any subscriptions yet. Browse our products to set up recurring deliveries.</p>
                    <button className="btn btn-primary">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Browse Products
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loyalty Tab */}
        {activeTab === "loyalty" && (
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Loyalty Transaction History</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Points</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${transaction.type === "earned" ? "bg-success" : "bg-danger"}`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <strong className={transaction.type === "earned" ? "text-success" : "text-danger"}>
                            {transaction.type === "earned" ? "+" : "-"}{Math.abs(transaction.points)}
                          </strong>
                        </td>
                        <td>{transaction.description || `Points ${transaction.type}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Redeem Points Modal */}
        {showRedeemModal && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Redeem Loyalty Points</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowRedeemModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleRedeemPoints}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Available Points</label>
                      <input
                        type="text"
                        className="form-control"
                        value={customer.loyaltyPoints.toLocaleString()}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Points to Redeem *</label>
                      <select name="points" className="form-select" required>
                        <option value="">Select reward...</option>
                        {customer.loyaltyPoints >= 500 && (
                          <option value="500">500 points - $5 discount</option>
                        )}
                        {customer.loyaltyPoints >= 1000 && (
                          <option value="1000">1000 points - $10 discount</option>
                        )}
                        {customer.loyaltyPoints >= 2000 && (
                          <option value="2000">2000 points - $20 discount</option>
                        )}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes (Optional)</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows={3}
                        placeholder="Any special instructions..."
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRedeemModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning"
                      disabled={redeemPointsMutation.isPending}
                    >
                      {redeemPointsMutation.isPending ? "Processing..." : "Redeem Points"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerPortal;