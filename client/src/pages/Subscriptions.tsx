import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopNav from "../components/TopNav";
import { apiRequest } from "../lib/queryClient";

interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  customerName?: string;
  productName?: string;
  status: "active" | "paused" | "cancelled";
  frequency: string;
  nextDelivery: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
}

const Subscriptions = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused" | "cancelled">("all");

  const { data: subscriptions, refetch } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/subscriptions", data),
    onSuccess: () => {
      setShowModal(false);
      setEditingSubscription(null);
      refetch();
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/subscriptions/${id}`, data),
    onSuccess: () => {
      setShowModal(false);
      setEditingSubscription(null);
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const subscriptionData = {
      customerId: formData.get("customerId"),
      productId: formData.get("productId"),
      status: formData.get("status"),
      frequency: formData.get("frequency"),
      nextDelivery: formData.get("nextDelivery"),
    };

    if (editingSubscription) {
      updateSubscriptionMutation.mutate({ id: editingSubscription.id, data: subscriptionData });
    } else {
      createSubscriptionMutation.mutate(subscriptionData);
    }
  };

  const openAddModal = () => {
    setEditingSubscription(null);
    setShowModal(true);
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const filteredSubscriptions = subscriptions?.filter(s => 
    filterStatus === "all" || s.status === filterStatus
  );

  // Calculate subscription stats
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const pausedSubscriptions = subscriptions?.filter(s => s.status === "paused").length || 0;
  const cancelledSubscriptions = subscriptions?.filter(s => s.status === "cancelled").length || 0;
  const totalSubscriptions = subscriptions?.length || 0;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active": return "bg-success";
      case "paused": return "bg-warning text-dark";
      case "cancelled": return "bg-danger";
      default: return "bg-secondary";
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case "weekly": return "fas fa-calendar-week";
      case "monthly": return "fas fa-calendar-alt";
      case "quarterly": return "fas fa-calendar";
      case "yearly": return "fas fa-calendar-check";
      default: return "fas fa-sync-alt";
    }
  };

  return (
    <>
      <TopNav 
        title="Subscription Management" 
        subtitle="Manage recurring orders and subscription billing"
      />
      <div className="content-wrapper">
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">{activeSubscriptions}</h3>
                <p className="mb-0">Active</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{pausedSubscriptions}</h3>
                <p className="mb-0">Paused</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-danger">{cancelledSubscriptions}</h3>
                <p className="mb-0">Cancelled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{totalSubscriptions}</h3>
                <p className="mb-0">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="btn-group">
            <button
              className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilterStatus("all")}
            >
              All ({totalSubscriptions})
            </button>
            <button
              className={`btn ${filterStatus === "active" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setFilterStatus("active")}
            >
              Active ({activeSubscriptions})
            </button>
            <button
              className={`btn ${filterStatus === "paused" ? "btn-warning" : "btn-outline-warning"}`}
              onClick={() => setFilterStatus("paused")}
            >
              Paused ({pausedSubscriptions})
            </button>
            <button
              className={`btn ${filterStatus === "cancelled" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setFilterStatus("cancelled")}
            >
              Cancelled ({cancelledSubscriptions})
            </button>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>
            Add Subscription
          </button>
        </div>

        {/* Subscriptions Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Frequency</th>
                    <th>Next Delivery</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions?.map((subscription) => {
                    const customer = customers?.find(c => c.id === subscription.customerId);
                    const product = products?.find(p => p.id === subscription.productId);
                    const nextDeliveryDate = new Date(subscription.nextDelivery);
                    const isOverdue = nextDeliveryDate < new Date() && subscription.status === "active";

                    return (
                      <tr key={subscription.id} className={isOverdue ? "table-warning" : ""}>
                        <td>
                          <div>
                            <strong>{customer?.name || "Unknown Customer"}</strong>
                            <br />
                            <small className="text-muted">{customer?.email}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{product?.name || "Unknown Product"}</strong>
                            <br />
                            <small className="text-muted">${parseFloat(product?.price || "0").toFixed(2)}</small>
                          </div>
                        </td>
                        <td>
                          <i className={`${getFrequencyIcon(subscription.frequency)} me-2`}></i>
                          {subscription.frequency}
                        </td>
                        <td>
                          <div>
                            {nextDeliveryDate.toLocaleDateString()}
                            {isOverdue && (
                              <>
                                <br />
                                <small className="text-danger">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Overdue
                                </small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(subscription.status)}`}>
                            {subscription.status.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(subscription.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openEditModal(subscription)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {subscription.status === "active" && (
                              <button
                                className="btn btn-outline-warning"
                                title="Pause"
                              >
                                <i className="fas fa-pause"></i>
                              </button>
                            )}
                            {subscription.status === "paused" && (
                              <button
                                className="btn btn-outline-success"
                                title="Resume"
                              >
                                <i className="fas fa-play"></i>
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger"
                              title="Cancel"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Subscription Modal */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingSubscription ? "Edit Subscription" : "Add New Subscription"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Customer *</label>
                      <select
                        name="customerId"
                        className="form-select"
                        defaultValue={editingSubscription?.customerId || ""}
                        required
                      >
                        <option value="">Select customer...</option>
                        {customers?.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Product *</label>
                      <select
                        name="productId"
                        className="form-select"
                        defaultValue={editingSubscription?.productId || ""}
                        required
                      >
                        <option value="">Select product...</option>
                        {products?.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - ${parseFloat(product.price || "0").toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Frequency *</label>
                          <select
                            name="frequency"
                            className="form-select"
                            defaultValue={editingSubscription?.frequency || ""}
                            required
                          >
                            <option value="">Select frequency...</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            className="form-select"
                            defaultValue={editingSubscription?.status || "active"}
                          >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Next Delivery Date *</label>
                      <input
                        type="date"
                        name="nextDelivery"
                        className="form-control"
                        defaultValue={editingSubscription?.nextDelivery ? 
                          new Date(editingSubscription.nextDelivery).toISOString().split('T')[0] : 
                          new Date().toISOString().split('T')[0]
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending}
                    >
                      {createSubscriptionMutation.isPending || updateSubscriptionMutation.isPending
                        ? "Saving..."
                        : editingSubscription
                        ? "Update Subscription"
                        : "Add Subscription"}
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

export default Subscriptions;