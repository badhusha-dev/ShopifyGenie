import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopNav from "../components/TopNav";
import CustomerTable from "../components/CustomerTable";
import { apiRequest } from "../lib/queryClient";

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: string;
  createdAt: string;
}

interface Order {
  id: string;
  total: string;
  status: string;
  createdAt: string;
}

const Customers = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, refetch } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: customerOrders } = useQuery<Order[]>({
    queryKey: [`/api/customers/${selectedCustomer?.id}/orders`],
    enabled: !!selectedCustomer,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/customers", data),
    onSuccess: () => {
      setShowModal(false);
      setEditingCustomer(null);
      refetch();
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/customers/${id}`, data),
    onSuccess: () => {
      setShowModal(false);
      setEditingCustomer(null);
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const customerData = {
      name: formData.get("name"),
      email: formData.get("email"),
      loyaltyPoints: parseInt(formData.get("loyaltyPoints") as string) || 0,
    };

    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: customerData });
    } else {
      createCustomerMutation.mutate(customerData);
    }
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const openDetailsModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate customer stats
  const totalCustomers = customers?.length || 0;
  const totalSpent = customers?.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0) || 0;
  const totalLoyaltyPoints = customers?.reduce((sum, c) => sum + c.loyaltyPoints, 0) || 0;
  const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <>
      <TopNav title="Customer Management" subtitle="Manage customer accounts and loyalty status" />
      <div className="content-wrapper">
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{totalCustomers}</h3>
                <p className="mb-0">Total Customers</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">${totalSpent.toFixed(2)}</h3>
                <p className="mb-0">Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{totalLoyaltyPoints.toLocaleString()}</h3>
                <p className="mb-0">Loyalty Points</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">${avgSpentPerCustomer.toFixed(2)}</h3>
                <p className="mb-0">Avg per Customer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="input-group" style={{ maxWidth: "300px" }}>
            <span className="input-group-text">
              <i className="fas fa-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>
            Add Customer
          </button>
        </div>

        {/* Customers Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Loyalty Points</th>
                    <th>Total Spent</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers?.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div>
                          <strong>{customer.name}</strong>
                          <br />
                          <small className="text-muted">{customer.email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-primary">{customer.loyaltyPoints.toLocaleString()}</span>
                      </td>
                      <td>
                        <strong>${parseFloat(customer.totalSpent || "0").toFixed(2)}</strong>
                      </td>
                      <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${parseFloat(customer.totalSpent || "0") > 100 ? "bg-success" : "bg-secondary"}`}>
                          {parseFloat(customer.totalSpent || "0") > 100 ? "VIP" : "Regular"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => openDetailsModal(customer)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(customer)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-success"
                            title="Add Points"
                          >
                            <i className="fas fa-star"></i>
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

        {/* Customer Modal */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
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
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        defaultValue={editingCustomer?.name || ""}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        defaultValue={editingCustomer?.email || ""}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Loyalty Points</label>
                      <input
                        type="number"
                        name="loyaltyPoints"
                        className="form-control"
                        defaultValue={editingCustomer?.loyaltyPoints || 0}
                        min="0"
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
                      disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    >
                      {createCustomerMutation.isPending || updateCustomerMutation.isPending
                        ? "Saving..."
                        : editingCustomer
                        ? "Update Customer"
                        : "Add Customer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details Modal */}
        {showDetailsModal && selectedCustomer && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Customer Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailsModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Customer Information</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Name:</strong></td>
                            <td>{selectedCustomer.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{selectedCustomer.email}</td>
                          </tr>
                          <tr>
                            <td><strong>Loyalty Points:</strong></td>
                            <td><span className="badge bg-primary">{selectedCustomer.loyaltyPoints}</span></td>
                          </tr>
                          <tr>
                            <td><strong>Total Spent:</strong></td>
                            <td><strong>${parseFloat(selectedCustomer.totalSpent || "0").toFixed(2)}</strong></td>
                          </tr>
                          <tr>
                            <td><strong>Member Since:</strong></td>
                            <td>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6>Recent Orders</h6>
                      {customerOrders && customerOrders.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customerOrders.slice(0, 5).map((order) => (
                                <tr key={order.id}>
                                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                  <td>${parseFloat(order.total).toFixed(2)}</td>
                                  <td>
                                    <span className="badge bg-success">{order.status}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No orders found</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Customers;