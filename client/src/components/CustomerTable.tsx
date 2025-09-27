import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

const CustomerTable = () => {
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/customers"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
                            customer.name
                          )} rounded-circle d-flex align-items-center justify-content-center text-white`}
                          style={{ width: "35px", height: "35px" }}
                        >
                          <small>{getInitials(customer.name)}</small>
                        </div>
                      </div>
                      <div>
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">{customer.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-info">{customer.loyaltyPoints} pts</span>
                  </td>
                  <td>
                    <span className="badge bg-success">0 active</span>
                  </td>
                  <td>
                    <small className="text-muted">N/A</small>
                  </td>
                  <td>
                    <strong>${customer.totalSpent}</strong>
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
