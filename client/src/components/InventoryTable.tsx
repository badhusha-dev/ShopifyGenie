import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

const InventoryTable = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/shopify/sync"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const getStockStatus = (stock: number) => {
    if (stock < 5) return { label: "Out of Stock", class: "bg-danger" };
    if (stock < 10) return { label: "Low Stock", class: "badge-low-stock" };
    return { label: "In Stock", class: "bg-success" };
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
        <h6 className="mb-0">Inventory Status</h6>
        <div>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <i className={`fas fa-sync me-1 ${syncMutation.isPending ? "fa-spin" : ""}`}></i>
            Sync with Shopify
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <i className="fas fa-download me-1"></i>
            Export
          </button>
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => {
                const status = getStockStatus(product.stock);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <div
                            className="bg-light rounded"
                            style={{ width: "40px", height: "40px" }}
                          ></div>
                        </div>
                        <div>
                          <div className="fw-semibold">{product.name}</div>
                          <small className="text-muted">{product.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{product.sku}</code>
                    </td>
                    <td>
                      <span
                        className={`fw-semibold ${
                          product.stock < 10 ? "text-danger" : "text-success"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${status.class}`}>{status.label}</span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(product.lastUpdated)}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-outline-info">
                          <i className="fas fa-eye"></i>
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
  );
};

export default InventoryTable;
