import TopNav from "../components/TopNav";
import CustomerTable from "../components/CustomerTable";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

const Customers = () => {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const totalCustomers = customers?.length || 0;
  const totalLoyaltyPoints = customers?.reduce((sum, customer) => sum + customer.loyaltyPoints, 0) || 0;
  const totalSpent = customers?.reduce((sum, customer) => sum + parseFloat(customer.totalSpent || '0'), 0) || 0;
  const avgSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

  return (
    <>
      <TopNav
        title="Customer Management"
        subtitle="Manage your customers and their loyalty information"
      />
      <div className="content-wrapper">
        {/* Customer Stats */}
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
                <h3 className="text-info">{totalLoyaltyPoints}</h3>
                <p className="mb-0">Total Loyalty Points</p>
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
                <h3 className="text-warning">${avgSpent.toFixed(2)}</h3>
                <p className="mb-0">Avg. Customer Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Actions */}
        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Customer Management Tools</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-primary w-100">
                      <i className="fas fa-user-plus me-2"></i>
                      Add New Customer
                    </button>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-outline-primary w-100">
                      <i className="fas fa-download me-2"></i>
                      Export Customer Data
                    </button>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-outline-info w-100">
                      <i className="fas fa-envelope me-2"></i>
                      Send Newsletter
                    </button>
                  </div>
                  <div className="col-md-6 mb-3">
                    <button className="btn btn-outline-success w-100">
                      <i className="fas fa-gift me-2"></i>
                      Award Bonus Points
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Search & Filter</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search customers..."
                  />
                </div>
                <div className="mb-3">
                  <select className="form-select">
                    <option value="">All Customers</option>
                    <option value="high-value">High Value</option>
                    <option value="loyalty-members">Loyalty Members</option>
                    <option value="subscribers">Subscribers</option>
                  </select>
                </div>
                <button className="btn btn-outline-secondary w-100">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="row">
          <div className="col-12">
            <CustomerTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default Customers;
