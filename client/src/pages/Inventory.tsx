import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import TopNav from "../components/TopNav";
import InventoryTable from "../components/InventoryTable";
import { apiRequest } from "../lib/queryClient";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: string;
  category: string;
  imageUrl?: string;
}

const Inventory = () => {
  const [showLowStock, setShowLowStock] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/products", data),
    onSuccess: () => {
      setShowModal(false);
      setEditingProduct(null);
      refetch();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/products/${id}`, data),
    onSuccess: () => {
      setShowModal(false);
      setEditingProduct(null);
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      stock: parseInt(formData.get("stock") as string),
      price: formData.get("price"),
      category: formData.get("category"),
      imageUrl: formData.get("imageUrl"),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const filteredProducts = showLowStock
    ? products?.filter(p => p.stock < 10)
    : products;

  return (
    <>
      <TopNav
        title="Inventory Management"
        subtitle="Track products, stock levels, and manage inventory alerts"
      />
      <div className="content-wrapper">
        {/* Stats Cards */}
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
                <h3 className="text-warning">{products?.filter(p => p.stock < 10).length || 0}</h3>
                <p className="mb-0">Low Stock</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">{products?.reduce((sum, p) => sum + p.stock, 0) || 0}</h3>
                <p className="mb-0">Total Stock</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-info">${products?.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0).toFixed(2) || "0.00"}</h3>
                <p className="mb-0">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="lowStockFilter"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="lowStockFilter">
              Show only low stock items
            </label>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts?.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="me-3"
                              style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                          )}
                          <div>
                            <strong>{product.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <code>{product.sku}</code>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <span className={`badge ${product.stock < 10 ? "bg-danger" : product.stock < 20 ? "bg-warning text-dark" : "bg-success"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>${parseFloat(product.price || "0").toFixed(2)}</td>
                      <td>
                        <span className={`badge ${product.stock > 0 ? "bg-success" : "bg-danger"}`}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-outline-success">
                            <i className="fas fa-plus"></i>
                          </button>
                          <button className="btn btn-outline-info">
                            <i className="fas fa-chart-line"></i>
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

        {/* Product Modal */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? "Edit Product" : "Add New Product"}
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
                      <label className="form-label">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        defaultValue={editingProduct?.name || ""}
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">SKU *</label>
                          <input
                            type="text"
                            name="sku"
                            className="form-control"
                            defaultValue={editingProduct?.sku || ""}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Category</label>
                          <select name="category" className="form-select" defaultValue={editingProduct?.category || ""}>
                            <option value="">Select category...</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Books">Books</option>
                            <option value="Home & Garden">Home & Garden</option>
                            <option value="Sports">Sports</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Stock Quantity *</label>
                          <input
                            type="number"
                            name="stock"
                            className="form-control"
                            defaultValue={editingProduct?.stock || 0}
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Price *</label>
                          <input
                            type="number"
                            name="price"
                            className="form-control"
                            step="0.01"
                            defaultValue={editingProduct?.price || ""}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image URL</label>
                      <input
                        type="url"
                        name="imageUrl"
                        className="form-control"
                        defaultValue={editingProduct?.imageUrl || ""}
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
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending
                        ? "Saving..."
                        : editingProduct
                        ? "Update Product"
                        : "Add Product"}
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

export default Inventory;