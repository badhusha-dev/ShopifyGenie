import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, setFilters, setSelectedProduct } from '../store/slices/inventorySlice';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import type { Product } from '@shared/schema';
import { FaWarehouse, FaBoxes, FaExclamationTriangle, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

// Category Select Component
const CategorySelect: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const { data: categories = [] } = useQuery({
    queryKey: ['/products/categories'],
    queryFn: async () => {
      const response = await fetch('/api/products/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">Select a category</option>
      {categories.map((category: any) => (
        <option key={category.id} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>
  );
};

interface InventoryProduct extends Product {
  lowStockThreshold?: number;
  status?: 'active' | 'draft';
}

const Inventory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showStockAdjustmentModal, setShowStockAdjustmentModal] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<InventoryProduct | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'add',
    quantity: '',
    reason: ''
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch products using Redux thunk
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
      // dispatch(fetchProducts()); // Re-fetch products after mutation
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
      // dispatch(fetchProducts()); // Re-fetch products after mutation
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
      // dispatch(fetchProducts()); // Re-fetch products after mutation
    },
    onError: () => {
      console.error('Failed to delete product');
    }
  });

  const bulkOperationMutation = useMutation({
    mutationFn: async (data: { action: string; productIds: string[]; updates?: any }) => {
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to perform bulk operation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSelectedProducts([]);
    },
    onError: () => {
      console.error('Failed to perform bulk operation');
    }
  });

  const stockAdjustmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/inventory/adjust-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to adjust stock');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowStockAdjustmentModal(false);
      setSelectedProductForAdjustment(null);
      setAdjustmentData({ adjustmentType: 'add', quantity: '', reason: '' });
    },
    onError: () => {
      console.error('Failed to adjust stock');
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    status: 'active' as 'active' | 'draft'
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
    dispatch(setSelectedProduct(null));
  };

  const handleEdit = (product: InventoryProduct) => {
    dispatch(setSelectedProduct(product as any));
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: (typeof product.price === 'string' ? parseFloat(product.price) : product.price || 0).toString(),
      stock: (product as any).stock?.toString() || '0',
      lowStockThreshold: (product.lowStockThreshold || 0).toString(),
      status: (product.status as 'active' | 'draft') || 'active'
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

    const currentSelectedProduct = useAppSelector((state) => state.inventory.selectedProduct);

    if (currentSelectedProduct) {
      updateProductMutation.mutate({ ...productData, id: currentSelectedProduct.id });
    } else {
      createProductMutation.mutate(productData);
    }
  };

  const handleStockAdjustment = (product: InventoryProduct) => {
    setSelectedProductForAdjustment(product);
    setShowStockAdjustmentModal(true);
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjustment) return;

    const adjustment = {
      productId: selectedProductForAdjustment.id,
      adjustmentType: adjustmentData.adjustmentType,
      quantity: parseInt(adjustmentData.quantity),
      reason: adjustmentData.reason
    };

    stockAdjustmentMutation.mutate(adjustment);
  };

  const getStockBadge = (product: InventoryProduct) => {
    if (product.stock === 0) {
      return <span className="badge bg-danger">Out of Stock</span>;
    } else if (product.stock <= (product.lowStockThreshold || 0)) {
      return <span className="badge bg-warning text-dark">Low Stock</span>;
    }
    return <span className="badge bg-success">In Stock</span>;
  };

  // Bulk operations handlers
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return;
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      bulkOperationMutation.mutate({ action: 'delete', productIds: selectedProducts });
    }
  };

  const handleBulkExport = () => {
    if (selectedProducts.length === 0) return;
    bulkOperationMutation.mutate({ action: 'export', productIds: selectedProducts });
  };

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: '',
      field: 'selected',
      sortable: false,
      filter: false,
      width: 50,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true
    },
    {
      headerName: 'Product',
      field: 'name',
      sortable: true,
      filter: true,
      width: 250,
      cellRenderer: (params: any) => {
        return (
          `<div class="d-flex align-items-center">
            <div class="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style="width: 40px; height: 40px;">
              <i class="fas fa-box text-primary"></i>
            </div>
            <div>
              <div class="fw-semibold">${params.value || 'N/A'}</div>
              <small class="text-muted">ID: ${(params.data.id || '').slice(0, 8)}</small>
            </div>
          </div>`
        );
      }
    },
    {
      headerName: 'Category',
      field: 'category',
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: 'Price',
      field: 'price',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const price = typeof params.value === 'string' ? parseFloat(params.value) : params.value;
        return `<span class="fw-semibold">$${(price || 0).toFixed(2)}</span>`;
      }
    },
    {
      headerName: 'Stock',
      field: 'stock',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        return (
          `<span class="fw-bold">${params.value || 0}</span>
           <small class="text-muted d-block">
             Threshold: ${params.data.lowStockThreshold || 0}
           </small>`
        );
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="badge ${params.value === 'active' ? 'bg-success' : 'bg-secondary'}">${params.value}</span>`
    },
    {
      headerName: 'Stock Status',
      field: 'stockStatus',
      sortable: true,
      filter: true,
      width: 140,
      cellRenderer: (params: any) => {
        const product = params.data;
        const stock = product.stock || 0;
        const threshold = product.lowStockThreshold || 0;
        
        if (stock === 0) {
          return '<span class="badge bg-danger">Out of Stock</span>';
        } else if (stock <= threshold) {
          return '<span class="badge bg-warning text-dark">Low Stock</span>';
        }
        return '<span class="badge bg-success">In Stock</span>';
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params: any) => `
        <div class="dropdown">
          <button
            class="btn btn-sm btn-outline-secondary rounded-circle"
            type="button"
            onclick="window.toggleInventoryDropdown('${params.data.id}')"
            style="width: 32px; height: 32px;"
          >
            <i class="fas fa-ellipsis-h"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" id="dropdown-${params.data.id}" style="display: none;">
            <li>
              <button 
                class="dropdown-item" 
                onclick="window.handleEditProduct('${params.data.id}')"
              >
                <i class="fas fa-edit me-2"></i>Edit
              </button>
            </li>
            <li>
              <button 
                class="dropdown-item" 
                onclick="window.handleStockAdjustment('${params.data.id}')"
              >
                <i class="fas fa-warehouse me-2"></i>Adjust Stock
              </button>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button 
                class="dropdown-item text-danger"
                onclick="window.handleDeleteProduct('${params.data.id}')"
              >
                <i class="fas fa-trash me-2"></i>Delete
              </button>
            </li>
          </ul>
        </div>
      `
    }
  ], []);

  const filteredProducts = products.filter((product: any) => {
    const name = product.name || '';
    const category = product.category || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showLowStock || (product.stock || 0) <= (product.lowStockThreshold || 0);
    return matchesSearch && matchesFilter;
  });

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).toggleInventoryDropdown = (id: string) => {
      const dropdown = document.getElementById(`dropdown-${id}`);
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      }
    };
    
    (window as any).handleEditProduct = (id: string) => {
      const product = filteredProducts.find(p => p.id === id);
      if (product) handleEdit(product as any);
    };
    
    (window as any).handleDeleteProduct = (id: string) => {
      deleteProductMutation.mutate(id);
    };
    
    (window as any).handleStockAdjustment = (id: string) => {
      const product = filteredProducts.find(p => p.id === id);
      if (product) handleStockAdjustment(product as any);
    };
    
    return () => {
      delete (window as any).toggleInventoryDropdown;
      delete (window as any).handleEditProduct;
      delete (window as any).handleDeleteProduct;
      delete (window as any).handleStockAdjustment;
    };
  }, [filteredProducts, deleteProductMutation]);


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
                <FaBoxes className="me-2 text-primary" />
                Inventory Management
              </h1>
              <p className="text-muted mb-0">Manage your products and stock levels</p>
            </div>
            <div className="d-flex gap-2">
              {selectedProducts.length > 0 && (
                <div className="btn-group me-2">
                  <button
                    className="btn btn-outline-danger d-flex align-items-center"
                    onClick={handleBulkDelete}
                    disabled={bulkOperationMutation.isPending}
                  >
                    <FaTrash className="me-2" />
                    Delete ({selectedProducts.length})
                  </button>
                  <button
                    className="btn btn-outline-info d-flex align-items-center"
                    onClick={handleBulkExport}
                    disabled={bulkOperationMutation.isPending}
                  >
                    <FaEye className="me-2" />
                    Export Selected
                  </button>
                </div>
              )}
              <button
                className="btn btn-outline-primary d-flex align-items-center"
                onClick={() => {
                  window.location.href = '/inventory-reports';
                }}
              >
                <FaChartLine className="me-2" />
                Reports
              </button>
              <button
                className="btn btn-shopify d-flex align-items-center"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <FaPlus className="me-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-primary bg-opacity-10 rounded-3 me-3">
                <FaBoxes className="fs-4 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 fw-bold">{products.length}</h3>
                <p className="mb-0 text-muted">Total Products</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-3 me-3">
                <FaWarehouse className="fs-4 text-success" />
              </div>
              <div>
                <h3 className="mb-1 fw-bold">
                  {products.reduce((sum, p) => sum + ((p as any).stock || 0), 0)}
                </h3>
                <p className="mb-0 text-muted">Total Stock</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-warning bg-opacity-10 rounded-3 me-3">
                <FaExclamationTriangle className="fs-4 text-warning" />
              </div>
              <div>
                <h3 className="mb-1 fw-bold">
                  {products.filter(p => (p as any).stock <= ((p as any).lowStockThreshold || 0)).length}
                </h3>
                <p className="mb-0 text-muted">Low Stock Items</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center">
              <div className="p-3 bg-danger bg-opacity-10 rounded-3 me-3">
                <FaBoxes className="fs-4 text-danger" />
              </div>
              <div>
                <h3 className="mb-1 fw-bold">
                  {products.filter(p => (p as any).stock === 0).length}
                </h3>
                <p className="mb-0 text-muted">Out of Stock</p>
              </div>
            </div>
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
            <AGDataGrid
              rowData={filteredProducts}
              columnDefs={columnDefs}
              loading={isLoading}
              pagination={true}
              paginationPageSize={25}
              height="600px"
              enableExport={true}
              exportFileName="inventory-products"
              showExportButtons={true}
              enableFiltering={true}
              enableSorting={true}
              enableResizing={true}
              sideBar={false}
              rowSelection="multiple"
              onSelectionChanged={(event: any) => {
                const selectedNodes = event.api.getSelectedNodes();
                const selectedIds = selectedNodes.map((node: any) => node.data.id);
                setSelectedProducts(selectedIds);
              }}
            />
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
                  {useAppSelector((state) => state.inventory.selectedProduct) ? 'Edit Product' : 'Add New Product'}
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
                          <CategorySelect
                            value={formData.category}
                            onChange={(category) => setFormData({...formData, category})}
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
                        {useAppSelector((state) => state.inventory.selectedProduct) ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {useAppSelector((state) => state.inventory.selectedProduct) ? 'Update' : 'Create'} Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showStockAdjustmentModal && selectedProductForAdjustment && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaWarehouse className="me-2" />
                  Adjust Stock - {selectedProductForAdjustment.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStockAdjustmentModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAdjustmentSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <strong>Current Stock:</strong> {selectedProductForAdjustment.stock} units
                      </div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="adjustmentType" className="form-label fw-semibold">Adjustment Type</label>
                      <select
                        className="form-select"
                        id="adjustmentType"
                        value={adjustmentData.adjustmentType}
                        onChange={(e) => setAdjustmentData({...adjustmentData, adjustmentType: e.target.value})}
                        required
                      >
                        <option value="add">Add Stock</option>
                        <option value="remove">Remove Stock</option>
                        <option value="set">Set Stock Level</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label htmlFor="quantity" className="form-label fw-semibold">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        value={adjustmentData.quantity}
                        onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="reason" className="form-label fw-semibold">Reason</label>
                      <textarea
                        className="form-control"
                        id="reason"
                        rows={3}
                        value={adjustmentData.reason}
                        onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                        placeholder="Enter reason for stock adjustment..."
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowStockAdjustmentModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={stockAdjustmentMutation.isPending}
                  >
                    {stockAdjustmentMutation.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Adjusting...
                      </>
                    ) : (
                      'Adjust Stock'
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