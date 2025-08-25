import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: 'active' | 'draft';
}

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    status: 'active' as 'active' | 'draft'
  });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      console.error('Failed to create product');
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch(`/api/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      console.error('Failed to update product');
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      console.error('Failed to delete product');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      lowStockThreshold: '',
      status: 'active'
    });
    setSelectedProduct(null);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold.toString(),
      status: product.status
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold)
    };

    if (selectedProduct) {
      updateProductMutation.mutate({ ...productData, id: selectedProduct.id });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const getStockBadge = (product: Product) => {
    if (product.stock === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    } else if (product.stock <= product.lowStockThreshold) {
      return <span className="badge bg-warning text-dark">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showLowStock || product.stock <= product.lowStockThreshold;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-12">
            <div className="placeholder-glow">
              <span className="placeholder col-4 mb-3"></span>
              <span className="placeholder w-100" style={{height: '400px'}}></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate-fade-in-up">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                <i className="fas fa-boxes me-2 text-primary"></i>
                Inventory Management
              </h1>
              <p className="text-muted mb-0">Manage your products and stock levels</p>
            </div>
            <button
              className="btn btn-shopify d-flex align-items-center"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="fas fa-plus me-2"></i>
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
                <div className="position-relative">
                  <i className="fas fa-search position-absolute text-muted" 
                     style={{left: '12px', top: '50%', transform: 'translateY(-50%)'}}></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{borderRadius: '12px'}}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lowStockFilter"
                    checked={showLowStock}
                    onChange={(e) => setShowLowStock(e.target.checked)}
                  />
                  <label className="form-check-label fw-medium" htmlFor="lowStockFilter">
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    Low Stock Only
                  </label>
                </div>
              </div>
              <div className="col-md-3 text-end">
                <span className="badge bg-info-subtle text-info px-3 py-2">
                  {filteredProducts.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="row">
        <div className="col-12">
          <div className="modern-card">
            <div className="table-responsive">
              <table className="table modern-table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Stock Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product: Product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center me-3" 
                               style={{width: '40px', height: '40px'}}>
                            <i className="fas fa-box text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{product.name}</div>
                            <small className="text-muted">ID: {product.id.slice(0, 8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td className="fw-semibold">${product.price.toFixed(2)}</td>
                      <td>
                        <span className="fw-bold">
                          {product.stock}
                        </span>
                        <small className="text-muted d-block">
                          Threshold: {product.lowStockThreshold}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>{getStockBadge(product)}</td>
                      <td className="text-end">
                        <div className="dropdown">
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-circle"
                            type="button"
                            data-bs-toggle="dropdown"
                            style={{width: '32px', height: '32px'}}
                          >
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleEdit(product)}
                              >
                                <i className="fas fa-edit me-2"></i>Edit
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger"
                                onClick={() => deleteProductMutation.mutate(product.id)}
                              >
                                <i className="fas fa-trash me-2"></i>Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Bootstrap Nav Tabs */}
                  <ul className="nav nav-tabs" id="productTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button 
                        className="nav-link active" 
                        id="general-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#general-tab-pane" 
                        type="button"
                      >
                        <i className="fas fa-info-circle me-2"></i>General
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className="nav-link" 
                        id="pricing-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#pricing-tab-pane" 
                        type="button"
                      >
                        <i className="fas fa-dollar-sign me-2"></i>Pricing
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className="nav-link" 
                        id="stock-tab" 
                        data-bs-toggle="tab" 
                        data-bs-target="#stock-tab-pane" 
                        type="button"
                      >
                        <i className="fas fa-warehouse me-2"></i>Stock
                      </button>
                    </li>
                  </ul>

                  {/* Tab Content */}
                  <div className="tab-content pt-4" id="productTabsContent">
                    {/* General Tab */}
                    <div className="tab-pane fade show active" id="general-tab-pane">
                      <div className="row g-3">
                        <div className="col-12">
                          <label htmlFor="name" className="form-label fw-semibold">Product Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label htmlFor="category" className="form-label fw-semibold">Category</label>
                          <input
                            type="text"
                            className="form-control"
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="status"
                              checked={formData.status === 'active'}
                              onChange={(e) => setFormData({...formData, status: e.target.checked ? 'active' : 'draft'})}
                            />
                            <label className="form-check-label fw-semibold" htmlFor="status">
                              Active Product
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Tab */}
                    <div className="tab-pane fade" id="pricing-tab-pane">
                      <div className="row g-3">
                        <div className="col-12">
                          <label htmlFor="price" className="form-label fw-semibold">Price ($)</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              id="price"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({...formData, price: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Tab */}
                    <div className="tab-pane fade" id="stock-tab-pane">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="stock" className="form-label fw-semibold">Stock Quantity</label>
                          <input
                            type="number"
                            className="form-control"
                            id="stock"
                            value={formData.stock}
                            onChange={(e) => setFormData({...formData, stock: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="lowStockThreshold" className="form-label fw-semibold">Low Stock Threshold</label>
                          <input
                            type="number"
                            className="form-control"
                            id="lowStockThreshold"
                            value={formData.lowStockThreshold}
                            onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>
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
                    className="btn btn-shopify"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {selectedProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {selectedProduct ? 'Update' : 'Create'} Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;