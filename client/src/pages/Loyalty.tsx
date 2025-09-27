import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "../lib/queryClient";

interface LoyaltyTransaction {
  id: string;
  customerId: string;
  customerName?: string;
  points: number;
  type: "earned" | "redeemed";
  description?: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: string;
  createdAt?: string;
}

const Loyalty = () => {
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [filterType, setFilterType] = useState<"all" | "earned" | "redeemed">("all");

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/customers"],
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery<LoyaltyTransaction[]>({
    queryKey: ["/loyalty/transactions"],
  });

  const { data: tierInfo } = useQuery({
    queryKey: ["/loyalty/tiers"],
  });

  const redeemPointsMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/customer/redeem-points", data),
    onSuccess: () => {
      setShowRedeemModal(false);
      setSelectedCustomer(null);
      refetchTransactions();
    },
  });

  const handleRedeemPoints = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const points = parseInt(formData.get("points") as string);
    const description = formData.get("description") as string;

    redeemPointsMutation.mutate({
      customerId: selectedCustomer?.id,
      points,
      description,
    });
  };

  const openRedeemModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowRedeemModal(true);
  };

  const filteredTransactions = transactions?.filter(t => 
    filterType === "all" || t.type === filterType
  );

  // Calculate loyalty stats
  const totalPointsEarned = transactions?.filter(t => t.type === "earned").reduce((sum, t) => sum + t.points, 0) || 0;
  const totalPointsRedeemed = transactions?.filter(t => t.type === "redeemed").reduce((sum, t) => sum + Math.abs(t.points), 0) || 0;
  const activeCustomers = customers?.filter(c => c.loyaltyPoints > 0).length || 0;
  const totalPointsIssued = customers?.reduce((sum, customer) => sum + customer.loyaltyPoints, 0) || 0;


  return (
    <>
    <div className="content-wrapper">
        {/* Loyalty Stats */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">{totalPointsIssued}</h3>
                <p className="mb-0">Total Points Issued</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{totalPointsRedeemed}</h3>
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
                <h3 className="text-primary">{totalPointsIssued - totalPointsRedeemed}</h3>
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
                  <input type="number" className="form-control" value={tierInfo?.pointsPerDollar || 1} readOnly />
                  <small className="text-muted">Customers earn {tierInfo?.pointsPerDollar || 1} point for every $1 spent</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Point Value (USD)</label>
                  <input type="number" className="form-control" value={tierInfo?.pointValueUSD || 0.01} readOnly />
                  <small className="text-muted">Each point is worth ${tierInfo?.pointValueUSD || 0.01}</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Minimum Redemption</label>
                  <input type="number" className="form-control" value={tierInfo?.minRedemptionPoints || 100} readOnly />
                  <small className="text-muted">Minimum {tierInfo?.minRedemptionPoints || 100} points required for redemption</small>
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
                  <button className="btn btn-outline-primary" onClick={() => openRedeemModal(customers![0])}>
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
                              <button className="btn btn-outline-primary" onClick={() => openRedeemModal(customer)}>
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

      {/* Redeem Points Modal */}
      {showRedeemModal && selectedCustomer && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Redeem Points for {selectedCustomer.name}</h5>
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
                      value={selectedCustomer.loyaltyPoints.toLocaleString()}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Points to Redeem *</label>
                    <input
                      type="number"
                      name="points"
                      className="form-control"
                      min="1"
                      max={selectedCustomer.loyaltyPoints}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows={3}
                      placeholder="Reason for redemption..."
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
    </>
  );
};

export default Loyalty;