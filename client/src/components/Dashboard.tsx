import { useQuery } from "@tanstack/react-query";

const DASHBOARD_API_URL = import.meta.env.VITE_DASHBOARD_API_URL || 'http://localhost:8000';

interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  date: string;
  source?: string;
}

interface InventoryStatus {
  lowStockCount: number;
  totalItems: number;
  date: string;
  source?: string;
}

interface CustomerMetrics {
  newCustomers: number;
  activeCustomers: number;
  churnRate: number;
  date: string;
  source?: string;
}

interface FinancialOverview {
  cashFlow: number;
  accountsReceivable: number;
  accountsPayable: number;
  date: string;
  source?: string;
}

const Dashboard = () => {
  const { data: salesData, isLoading: salesLoading } = useQuery<{ success: boolean; data: SalesSummary }>({
    queryKey: [`${DASHBOARD_API_URL}/api/dashboard/sales-summary`],
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery<{ success: boolean; data: InventoryStatus }>({
    queryKey: [`${DASHBOARD_API_URL}/api/dashboard/inventory-status`],
  });

  const { data: customerData, isLoading: customerLoading } = useQuery<{ success: boolean; data: CustomerMetrics }>({
    queryKey: [`${DASHBOARD_API_URL}/api/dashboard/customer-metrics`],
  });

  const { data: financialData, isLoading: financialLoading } = useQuery<{ success: boolean; data: FinancialOverview }>({
    queryKey: [`${DASHBOARD_API_URL}/api/dashboard/financial-overview`],
  });

  const isLoading = salesLoading || inventoryLoading || customerLoading || financialLoading;

  if (isLoading) {
    return (
      <div className="row mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-lg-3 col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="placeholder-glow">
                  <span className="placeholder col-6"></span>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sales = salesData?.data;
  const inventory = inventoryData?.data;
  const customer = customerData?.data;
  const financial = financialData?.data;

  return (
    <div>
      <div className="row mb-4">
        {/* Sales Summary Card */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-primary text-white" data-testid="card-sales-summary">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1" data-testid="text-total-sales">{formatCurrency(sales?.totalSales || 0)}</h3>
                  <p className="mb-0">Total Sales</p>
                  <small className="opacity-75">Revenue: {formatCurrency(sales?.totalRevenue || 0)}</small>
                </div>
                <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
              </div>
              {sales?.source && (
                <small className="badge bg-light text-dark mt-2">
                  Source: {sales.source}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Status Card */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-warning text-white" data-testid="card-inventory-status">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1" data-testid="text-low-stock">{inventory?.lowStockCount || 0}</h3>
                  <p className="mb-0">Low Stock Alert</p>
                  <small className="opacity-75">Total Items: {inventory?.totalItems || 0}</small>
                </div>
                <i className="fas fa-exclamation-triangle fa-2x opacity-75"></i>
              </div>
              {inventory?.source && (
                <small className="badge bg-light text-dark mt-2">
                  Source: {inventory.source}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Customer Metrics Card */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-info text-white" data-testid="card-customer-metrics">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1" data-testid="text-new-customers">{customer?.newCustomers || 0}</h3>
                  <p className="mb-0">New Customers</p>
                  <small className="opacity-75">Active: {customer?.activeCustomers || 0}</small>
                </div>
                <i className="fas fa-users fa-2x opacity-75"></i>
              </div>
              {customer?.source && (
                <small className="badge bg-light text-dark mt-2">
                  Source: {customer.source}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Financial Overview Card */}
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card bg-success text-white" data-testid="card-financial-overview">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h3 className="mb-1" data-testid="text-cash-flow">{formatCurrency(financial?.cashFlow || 0)}</h3>
                  <p className="mb-0">Cash Flow</p>
                  <small className="opacity-75">A/R: {formatCurrency(financial?.accountsReceivable || 0)}</small>
                </div>
                <i className="fas fa-chart-line fa-2x opacity-75"></i>
              </div>
              {financial?.source && (
                <small className="badge bg-light text-dark mt-2">
                  Source: {financial.source}
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Row */}
      <div className="row mb-4">
        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card" data-testid="card-profit">
            <div className="card-body">
              <h6 className="text-muted mb-2">Total Profit</h6>
              <h4 className="mb-0" data-testid="text-total-profit">{formatCurrency(sales?.totalProfit || 0)}</h4>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card" data-testid="card-churn-rate">
            <div className="card-body">
              <h6 className="text-muted mb-2">Customer Churn Rate</h6>
              <h4 className="mb-0" data-testid="text-churn-rate">{customer?.churnRate || 0}%</h4>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-md-6 mb-3">
          <div className="card" data-testid="card-payables">
            <div className="card-body">
              <h6 className="text-muted mb-2">Accounts Payable</h6>
              <h4 className="mb-0" data-testid="text-accounts-payable">{formatCurrency(financial?.accountsPayable || 0)}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
