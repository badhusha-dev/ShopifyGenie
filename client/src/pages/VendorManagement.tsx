
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  address?: string;
  paymentTerms?: number;
  outstandingDues: string;
  totalSpent: string;
  isActive: boolean;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  status: string;
  totalAmount: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string;
}

const VendorManagement = () => {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendorModal, setVendorModal] = useState<{ show: boolean; vendor: Vendor | null }>({ show: false, vendor: null });
  const [poModal, setPOModal] = useState<{ show: boolean; po: PurchaseOrder | null }>({ show: false, po: null });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ['/vendors'],
  });

  const { data: purchaseOrders } = useQuery<PurchaseOrder[]>({
    queryKey: ['/purchase-orders'],
  });

  const { data: vendorAnalytics } = useQuery({
    queryKey: ['/vendor-analytics'],
  });

  const { data: poRecommendations } = useQuery({
    queryKey: ['/purchase-order-recommendations'],
  });

  const vendorMutation = useMutation({
    mutationFn: (data: any) => 
      vendorModal.vendor 
        ? apiRequest('PUT', `/api/vendors/${vendorModal.vendor.id}`, data)
        : apiRequest('POST', '/api/vendors', data),
    onSuccess: () => setVendorModal({ show: false, vendor: null }),
  });

  const poMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/purchase-orders', data),
    onSuccess: () => setPOModal({ show: false, po: null }),
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-secondary';
      case 'sent': return 'bg-primary';
      case 'partial': return 'bg-warning text-dark';
      case 'delivered': return 'bg-success';
      case 'closed': return 'bg-dark';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    vendorMutation.mutate({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      contactPerson: formData.get('contactPerson'),
      address: formData.get('address'),
      paymentTerms: parseInt(formData.get('paymentTerms') as string),
    });
  };

  return (
    <>
    <div className="content-wrapper">
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Complete Supplier Relationship Management</h5>
            <p className="mb-3">
              Streamline your entire vendor ecosystem with comprehensive tools for managing suppliers, 
              tracking purchase orders, monitoring payments, and analyzing vendor performance.
            </p>
            
            <div className="row">
              <div className="col-md-6">
                <h6 className="text-primary mb-2">Vendor Management Tools:</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Complete vendor database with contact management and history</li>
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Purchase order creation, tracking, and automated status updates</li>
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Payment tracking with outstanding dues and payment terms</li>
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Vendor performance analytics and delivery scorecards</li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Automated reorder recommendations based on stock levels</li>
                  <li className="mb-2"><i className="fas fa-handshake text-success me-2"></i>Cost analysis and vendor comparison reports</li>
                </ul>
                <div className="mt-3">
                  <strong className="text-warning">Benefit:</strong>
                  <p className="mb-0 small">Optimize supplier relationships and reduce procurement costs by 15-25% through better vendor management and automated purchase order workflows.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{vendors?.length || 0}</h3>
                <p className="mb-0">Active Vendors</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-warning">{purchaseOrders?.filter(po => po.status === 'sent').length || 0}</h3>
                <p className="mb-0">Pending POs</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">
                  ${vendors?.reduce((sum, v) => sum + parseFloat(v.totalSpent || '0'), 0).toLocaleString() || 0}
                </h3>
                <p className="mb-0">Total Spent</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-danger">
                  ${vendors?.reduce((sum, v) => sum + parseFloat(v.outstandingDues || '0'), 0).toLocaleString() || 0}
                </h3>
                <p className="mb-0">Outstanding Dues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'vendors' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendors')}
            >
              <i className="fas fa-users me-2"></i>
              Vendors
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'purchase-orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchase-orders')}
            >
              <i className="fas fa-file-invoice me-2"></i>
              Purchase Orders
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-bar me-2"></i>
              Analytics
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <i className="fas fa-lightbulb me-2"></i>
              Recommendations
            </button>
          </li>
        </ul>

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    Vendor Directory
                  </h6>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setVendorModal({ show: true, vendor: null })}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Add Vendor
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Vendor</th>
                          <th>Contact</th>
                          <th>Total Spent</th>
                          <th>Outstanding</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendors?.map((vendor) => (
                          <tr key={vendor.id}>
                            <td>
                              <div>
                                <strong>{vendor.name}</strong>
                                <br />
                                <small className="text-muted">{vendor.contactPerson}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <small>{vendor.email}</small>
                                <br />
                                <small>{vendor.phone}</small>
                              </div>
                            </td>
                            <td>
                              <strong>${parseFloat(vendor.totalSpent || '0').toLocaleString()}</strong>
                            </td>
                            <td>
                              <span className={`badge ${parseFloat(vendor.outstandingDues || '0') > 0 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                ${parseFloat(vendor.outstandingDues || '0').toLocaleString()}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${vendor.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {vendor.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => setVendorModal({ show: true, vendor })}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-outline-success">
                                  <i className="fas fa-file-invoice"></i>
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
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'purchase-orders' && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="fas fa-file-invoice me-2"></i>
                    Purchase Orders
                  </h6>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPOModal({ show: true, po: null })}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Create PO
                  </button>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>PO Number</th>
                          <th>Vendor</th>
                          <th>Amount</th>
                          <th>Order Date</th>
                          <th>Expected Delivery</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders?.map((po) => (
                          <tr key={po.id}>
                            <td>
                              <strong>{po.poNumber}</strong>
                            </td>
                            <td>{po.vendorName}</td>
                            <td>
                              <strong>${parseFloat(po.totalAmount || '0').toLocaleString()}</strong>
                            </td>
                            <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                            <td>
                              {po.expectedDelivery ? new Date(po.expectedDelivery).toLocaleDateString() : 'TBD'}
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(po.status)}`}>
                                {po.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button className="btn btn-outline-primary">
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button className="btn btn-outline-success">
                                  <i className="fas fa-truck"></i>
                                </button>
                                <button className="btn btn-outline-warning">
                                  <i className="fas fa-dollar-sign"></i>
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
            </div>
          </div>
        )}

        {/* Vendor Modal */}
        {vendorModal.show && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {vendorModal.vendor ? 'Edit Vendor' : 'Add New Vendor'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setVendorModal({ show: false, vendor: null })}
                  ></button>
                </div>
                <form onSubmit={handleVendorSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Vendor Name *</label>
                          <input
                            type="text"
                            name="name"
                            className="form-control"
                            defaultValue={vendorModal.vendor?.name || ''}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Contact Person</label>
                          <input
                            type="text"
                            name="contactPerson"
                            className="form-control"
                            defaultValue={vendorModal.vendor?.contactPerson || ''}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            defaultValue={vendorModal.vendor?.email || ''}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            defaultValue={vendorModal.vendor?.phone || ''}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        name="address"
                        className="form-control"
                        rows={3}
                        defaultValue={vendorModal.vendor?.address || ''}
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Payment Terms (Days)</label>
                          <input
                            type="number"
                            name="paymentTerms"
                            className="form-control"
                            defaultValue={vendorModal.vendor?.paymentTerms || 30}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setVendorModal({ show: false, vendor: null })}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={vendorMutation.isPending}
                    >
                      {vendorMutation.isPending ? 'Saving...' : 'Save Vendor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default VendorManagement;
