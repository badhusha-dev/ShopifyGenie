
import React, { useState } from 'react';
import TopNav from '../components/TopNav';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface StockForecast {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  dailyConsumption: number;
  daysUntilOut: number;
  status: 'good' | 'warning' | 'critical';
  batches: {
    batchNumber: string;
    quantity: number;
    expiryDate: string | null;
    daysToExpiry: number | null;
  }[];
}

interface ExpiringStock {
  id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  daysToExpiry: number;
  warehouseName: string;
}

const AdvancedInventory = () => {
  const [activeTab, setActiveTab] = useState('forecast');
  const [adjustmentModal, setAdjustmentModal] = useState({ show: false, batch: null });

  const { data: forecast } = useQuery<StockForecast[]>({
    queryKey: ['/api/inventory/advanced-forecast'],
  });

  const { data: expiringStock } = useQuery<ExpiringStock[]>({
    queryKey: ['/api/inventory/expiring-stock'],
  });

  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
  });

  const adjustmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/inventory/adjust-stock', data),
    onSuccess: () => {
      setAdjustmentModal({ show: false, batch: null });
      // Refresh data
    },
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-danger';
      case 'warning': return 'bg-warning text-dark';
      default: return 'bg-success';
    }
  };

  const handleStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    adjustmentMutation.mutate({
      batchId: adjustmentModal.batch?.id,
      adjustmentType: formData.get('adjustmentType'),
      newQuantity: parseInt(formData.get('newQuantity') as string),
      reason: formData.get('reason'),
    });
  };

  return (
    <>
      <TopNav
        title="Advanced Inventory Management"
        subtitle="Batch tracking, FIFO, and expiry management"
      />
      <div className="content-wrapper">
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'forecast' ? 'active' : ''}`}
              onClick={() => setActiveTab('forecast')}
            >
              <i className="fas fa-chart-line me-2"></i>
              Stock Forecast
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'expiring' ? 'active' : ''}`}
              onClick={() => setActiveTab('expiring')}
            >
              <i className="fas fa-calendar-times me-2"></i>
              Expiring Stock
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'batches' ? 'active' : ''}`}
              onClick={() => setActiveTab('batches')}
            >
              <i className="fas fa-boxes me-2"></i>
              Batch Management
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <i className="fas fa-history me-2"></i>
              Audit Trail
            </button>
          </li>
        </ul>

        {/* Stock Forecast Tab */}
        {activeTab === 'forecast' && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="fas fa-chart-line me-2"></i>
                    Stock Forecast & Days Until Out
                  </h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Warehouse</th>
                          <th>Current Stock</th>
                          <th>Daily Usage</th>
                          <th>Days Until Out</th>
                          <th>Status</th>
                          <th>Batches</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast?.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{item.productName}</strong>
                              <br />
                              <small className="text-muted">ID: {item.productId}</small>
                            </td>
                            <td>{item.warehouseName}</td>
                            <td>
                              <span className="fs-5">{item.totalStock}</span>
                              <small className="text-muted d-block">units</small>
                            </td>
                            <td>
                              {item.dailyConsumption.toFixed(1)}
                              <small className="text-muted d-block">per day</small>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {item.daysUntilOut > 999 ? '∞' : `${item.daysUntilOut} days`}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <small>
                                {item.batches.length} batch(es)
                                {item.batches.some(b => b.daysToExpiry && b.daysToExpiry <= 30) && (
                                  <><br /><span className="text-warning">⚠ Expiring soon</span></>
                                )}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => {/* View details */}}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => {/* Reorder */}}
                                >
                                  <i className="fas fa-shopping-cart"></i>
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

        {/* Expiring Stock Tab */}
        {activeTab === 'expiring' && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="fas fa-calendar-times me-2"></i>
                    Expiring Stock (Next 30 Days)
                  </h6>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-warning">
                      <i className="fas fa-tag me-1"></i>
                      Mark for Clearance
                    </button>
                    <button className="btn btn-outline-danger">
                      <i className="fas fa-trash me-1"></i>
                      Bulk Dispose
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>
                            <input type="checkbox" className="form-check-input" />
                          </th>
                          <th>Product</th>
                          <th>Batch Number</th>
                          <th>Quantity</th>
                          <th>Expiry Date</th>
                          <th>Days Left</th>
                          <th>Warehouse</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringStock?.map((item) => (
                          <tr key={item.id} className={item.daysToExpiry <= 7 ? 'table-danger' : item.daysToExpiry <= 15 ? 'table-warning' : ''}>
                            <td>
                              <input type="checkbox" className="form-check-input" />
                            </td>
                            <td>
                              <strong>{item.productName}</strong>
                            </td>
                            <td>
                              <code>{item.batchNumber}</code>
                            </td>
                            <td>{item.quantity}</td>
                            <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${item.daysToExpiry <= 7 ? 'bg-danger' : item.daysToExpiry <= 15 ? 'bg-warning text-dark' : 'bg-info'}`}>
                                {item.daysToExpiry} days
                              </span>
                            </td>
                            <td>{item.warehouseName}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => setAdjustmentModal({ show: true, batch: item })}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn btn-outline-danger">
                                  <i className="fas fa-trash"></i>
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

        {/* Stock Adjustment Modal */}
        {adjustmentModal.show && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Stock Adjustment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setAdjustmentModal({ show: false, batch: null })}
                  ></button>
                </div>
                <form onSubmit={handleStockAdjustment}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Adjustment Type</label>
                      <select name="adjustmentType" className="form-select" required>
                        <option value="">Select type...</option>
                        <option value="damaged">Damaged</option>
                        <option value="expired">Expired</option>
                        <option value="theft">Theft/Loss</option>
                        <option value="correction">Count Correction</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Current Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={adjustmentModal.batch?.quantity || 0}
                        readOnly
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Quantity</label>
                      <input
                        type="number"
                        name="newQuantity"
                        className="form-control"
                        min="0"
                        max={adjustmentModal.batch?.quantity || 0}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Reason</label>
                      <textarea
                        name="reason"
                        className="form-control"
                        rows={3}
                        placeholder="Explain the reason for this adjustment..."
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setAdjustmentModal({ show: false, batch: null })}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={adjustmentMutation.isPending}
                    >
                      {adjustmentMutation.isPending ? 'Adjusting...' : 'Adjust Stock'}
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

export default AdvancedInventory;
