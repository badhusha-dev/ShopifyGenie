import { useCustomers } from "../hooks/useApi";
import type { Customer } from "../lib/api";

const CustomerTable = () => {
  const { data: customers, isLoading, error } = useCustomers();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-secondary"];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-8"></span>
            <span className="placeholder col-6"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error loading customers: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Recent Customer Activity</h6>
        <button className="btn btn-outline-secondary btn-sm">
          View All Customers
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>Loyalty Points</th>
                <th>Subscriptions</th>
                <th>Last Order</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers?.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <div
                          className={`${getAvatarColor(
                            customer.firstName + customer.lastName
                          )} rounded-circle d-flex align-items-center justify-content-center text-white`}
                          style={{ width: "35px", height: "35px" }}
                        >
                          <small>{getInitials(customer.firstName, customer.lastName)}</small>
                        </div>
                      </div>
                      <div>
                        <div className="fw-semibold">{customer.firstName} {customer.lastName}</div>
                        <small className="text-muted">{customer.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info">0 pts</span>
                  </td>
                  <td>
                    <span className="badge bg-success">0 active</span>
                  </td>
                  <td>
                    <small className="text-muted">N/A</small>
                  </td>
                  <td>
                    <strong>$0.00</strong>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn btn-outline-info">
                        <i className="fas fa-envelope"></i>
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
  );
};

export default CustomerTable;
