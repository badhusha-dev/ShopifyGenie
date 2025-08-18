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
