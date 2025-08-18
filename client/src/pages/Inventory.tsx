import TopNav from "../components/TopNav";
import InventoryTable from "../components/InventoryTable";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

const Inventory = () => {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: lowStockProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/low-stock"],
  });

  const { data: stockForecast } = useQuery({
    queryKey: ["/api/inventory/forecast"],
  });

  return (
    <>
      <TopNav
        title="Inventory Management"
        subtitle="Manage your product inventory and stock levels"
      />
      <div className="content-wrapper">
        {/* Stock Alerts */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning d-flex align-items-center">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <div>
                  <strong>Low Stock Alert:</strong> {lowStockProducts.length} products are running low on stock
                  and need immediate attention.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{products?.length || 0}</h3>
                <p className="mb-0">Total Products</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{lowStockProducts?.length || 0}</h3>
                <p className="mb-0">Low Stock Items</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-danger">
                  {products?.filter(p => p.stock === 0).length || 0}
                </h3>
                <p className="mb-0">Out of Stock</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">
                  {products?.reduce((sum, p) => sum + p.stock, 0) || 0}
                </h3>
                <p className="mb-0">Total Stock Units</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Forecast */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-chart-line me-2"></i>
                  Stock Forecast & Alerts
                </h6>
              </div>
              <div className="card-body">
                {stockForecast && stockForecast.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Current Stock</th>
                          <th>Daily Sales Avg</th>
                          <th>Days Left</th>
                          <th>Forecast Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockForecast
                          .filter((item: any) => item.daysLeft < 30)
                          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
                          .map((item: any) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.name}</strong>
                              </td>
                              <td>
                                <span className={`badge ${
                                  item.stock < 10 ? 'bg-danger' : 
                                  item.stock < 25 ? 'bg-warning' : 'bg-success'
                                }`}>
                                  {item.stock} units
                                </span>
                              </td>
                              <td>{item.dailySales} units/day</td>
                              <td>
                                <strong className={
                                  item.daysLeft < 7 ? 'text-danger' :
                                  item.daysLeft < 14 ? 'text-warning' : 'text-success'
                                }>
                                  {item.daysLeft} days
                                </strong>
                              </td>
                              <td>
                                <span className={`badge ${
                                  item.status === 'critical' ? 'bg-danger' :
                                  item.status === 'warning' ? 'bg-warning' : 'bg-success'
                                }`}>
                                  {item.status === 'critical' ? 'REORDER NOW' :
                                   item.status === 'warning' ? 'REORDER SOON' : 'GOOD'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <h6 className="text-muted">Loading forecast data...</h6>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="row">
          <div className="col-12">
            <InventoryTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default Inventory;
