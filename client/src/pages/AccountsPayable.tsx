import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileInvoice, FaSearch, FaFilter, FaCalendarAlt, FaExclamationTriangle, FaDollarSign, FaMoneyBillWave } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedModal from '../components/ui/AnimatedModal';
import { designTokens } from '../design/tokens';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../hooks/use-toast';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Form Schema
const payableSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  purchaseOrderId: z.string().optional(),
  billNumber: z.string().min(1, "Bill number is required"),
  billDate: z.string().min(1, "Bill date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalAmount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentTerms: z.coerce.number().min(1).max(365).default(30),
});

type PayableFormData = z.infer<typeof payableSchema>;

interface AccountsPayable {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  purchaseOrderId?: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
  status: string;
  paymentTerms: number;
  daysPastDue: number;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
}

const AccountsPayable = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPayable, setEditingPayable] = useState<AccountsPayable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAging, setFilterAging] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { toast } = useToast();
  
  // Page load animation
  useEffect(() => {
    setIsPageLoading(false);
  }, []);
  
  const queryClient = useQueryClient();

  // Fetch accounts payable
  const { data: payables = [], isLoading, error } = useQuery<AccountsPayable[]>({
    queryKey: ['/api/accounts-payable'],
  });

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors'],
  });

  // Create/Update payable mutation
  const savePayableMutation = useMutation({
    mutationFn: async (data: PayableFormData) => {
      const payload = {
        ...data,
        outstandingAmount: data.totalAmount, // Initially equals total amount
      };

      if (editingPayable) {
        const response = await fetch(`/api/accounts-payable/${editingPayable.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update payable');
        return response.json();
      } else {
        const response = await fetch('/api/accounts-payable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create payable');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-payable'] });
      setShowModal(false);
      setEditingPayable(null);
      reset();
    },
  });

  // Payment recording mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await fetch(`/api/accounts-payable/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Failed to record payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-payable'] });
    },
  });

  // Delete payable mutation
  const deletePayableMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accounts-payable/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete payable');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-payable'] });
    },
  });

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PayableFormData>({
    resolver: zodResolver(payableSchema),
    defaultValues: {
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 30
    }
  });

  // Calculate aging buckets
  const agingAnalysis = useMemo(() => {
    const buckets = {
      current: { count: 0, amount: 0 }, // 0-30 days
      thirtyDays: { count: 0, amount: 0 }, // 31-60 days
      sixtyDays: { count: 0, amount: 0 }, // 61-90 days
      ninetyDays: { count: 0, amount: 0 }, // 91+ days
      total: { count: 0, amount: 0 }
    };

    payables.forEach((payable: AccountsPayable) => {
      const outstanding = parseFloat(payable.outstandingAmount);
      if (outstanding <= 0) return;

      buckets.total.count++;
      buckets.total.amount += outstanding;

      const daysPastDue = payable.daysPastDue || 0;
      
      if (daysPastDue <= 30) {
        buckets.current.count++;
        buckets.current.amount += outstanding;
      } else if (daysPastDue <= 60) {
        buckets.thirtyDays.count++;
        buckets.thirtyDays.amount += outstanding;
      } else if (daysPastDue <= 90) {
        buckets.sixtyDays.count++;
        buckets.sixtyDays.amount += outstanding;
      } else {
        buckets.ninetyDays.count++;
        buckets.ninetyDays.amount += outstanding;
      }
    });

    return buckets;
  }, [payables]);

  // Filter payables
  const filteredPayables = payables.filter((payable: AccountsPayable) => {
    if (!payable) return false;
    
    const safeSearchTerm = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (payable.billNumber || '').toLowerCase().includes(safeSearchTerm) ||
      (payable.vendorName || '').toLowerCase().includes(safeSearchTerm) ||
      (payable.vendorEmail && payable.vendorEmail.toLowerCase().includes(safeSearchTerm));
    
    const matchesStatus = !filterStatus || payable.status === filterStatus;
    
    let matchesAging = true;
    if (filterAging) {
      const daysPastDue = payable.daysPastDue || 0;
      switch (filterAging) {
        case 'current':
          matchesAging = daysPastDue <= 30;
          break;
        case '31-60':
          matchesAging = daysPastDue > 30 && daysPastDue <= 60;
          break;
        case '61-90':
          matchesAging = daysPastDue > 60 && daysPastDue <= 90;
          break;
        case '90+':
          matchesAging = daysPastDue > 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAging;
  });

  const handleEdit = (payable: AccountsPayable) => {
    setEditingPayable(payable);
    setValue('vendorId', payable.vendorId);
    setValue('purchaseOrderId', payable.purchaseOrderId || '');
    setValue('billNumber', payable.billNumber);
    setValue('billDate', payable.billDate.split('T')[0]);
    setValue('dueDate', payable.dueDate.split('T')[0]);
    setValue('totalAmount', parseFloat(payable.totalAmount));
    setValue('paymentTerms', payable.paymentTerms);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPayable(null);
    reset({
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 30
    });
    setShowModal(true);
  };

  const onSubmit = (data: PayableFormData) => {
    savePayableMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      deletePayableMutation.mutate(id);
    }
  };

  const handleRecordPayment = (payable: AccountsPayable) => {
    const amount = prompt(`Record payment for Bill ${payable.billNumber}\nOutstanding: $${payable.outstandingAmount}\n\nEnter payment amount:`);
    if (amount && !isNaN(parseFloat(amount))) {
      const paymentAmount = parseFloat(amount);
      if (paymentAmount > 0 && paymentAmount <= parseFloat(payable.outstandingAmount)) {
        recordPaymentMutation.mutate({ id: payable.id, amount: paymentAmount });
      } else {
        alert('Invalid payment amount');
      }
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pending' },
      partial: { bg: 'info', text: 'Partial' },
      paid: { bg: 'success', text: 'Paid' },
      overdue: { bg: 'danger', text: 'Overdue' }
    };
    const badge = badges[status as keyof typeof badges] || { bg: 'secondary', text: status };
    return (
      <span className={`badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25`}>
        {badge.text}
      </span>
    );
  };

  // Aging badge
  const getAgingBadge = (daysPastDue: number) => {
    if (daysPastDue <= 30) return { bg: 'success', text: 'Current' };
    if (daysPastDue <= 60) return { bg: 'warning', text: '31-60 days' };
    if (daysPastDue <= 90) return { bg: 'danger', text: '61-90 days' };
    return { bg: 'dark', text: '90+ days' };
  };

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Bill #',
      field: 'billNumber',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-primary">${params.value}</span>`
    },
    {
      headerName: 'Vendor',
      field: 'vendorName',
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-semibold">${params.data.vendorName}</div>
          ${params.data.vendorEmail ? `<small class="text-muted">${params.data.vendorEmail}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'Bill Date',
      field: 'billDate',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Due Date',
      field: 'dueDate',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const isOverdue = params.data.daysPastDue > 0 && params.data.status !== 'paid';
        return `
          <div class="${isOverdue ? 'text-danger' : ''}">
            ${new Date(params.value).toLocaleDateString()}
            ${isOverdue ? '<i class="fas fa-exclamation-triangle ms-1"></i>' : ''}
          </div>
        `;
      }
    },
    {
      headerName: 'Total',
      field: 'totalAmount',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="font-monospace">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Outstanding',
      field: 'outstandingAmount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-danger">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Aging',
      field: 'daysPastDue',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        const aging = getAgingBadge(params.value || 0);
        return `<span class="badge bg-${aging.bg} bg-opacity-10 text-${aging.bg} border border-${aging.bg} border-opacity-25">${aging.text}</span>`;
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        const badges = {
          pending: { bg: 'warning', text: 'Pending' },
          partial: { bg: 'info', text: 'Partial' },
          paid: { bg: 'success', text: 'Paid' },
          overdue: { bg: 'danger', text: 'Overdue' }
        };
        const badge = badges[params.value as keyof typeof badges] || { bg: 'secondary', text: params.value };
        return `<span class="badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25">${badge.text}</span>`;
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 160,
      cellRenderer: (params: any) => `
        <div class="d-flex gap-1">
          ${params.data.status !== 'paid' && parseFloat(params.data.outstandingAmount) > 0 ? 
            `<button onclick="window.handleRecordPayment('${params.data.id}')" class="btn btn-outline-success btn-sm" title="Record Payment">
              <i class="fas fa-dollar-sign"></i>
            </button>` : ''}
          <button onclick="window.handleEdit('${params.data.id}')" class="btn btn-outline-primary btn-sm" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="window.handleDelete('${params.data.id}')" class="btn btn-outline-danger btn-sm" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleRecordPayment = (id: string) => {
      const payable = payables.find(p => p.id === id);
      if (payable) handleRecordPayment(payable);
    };
    
    (window as any).handleEdit = (id: string) => {
      const payable = payables.find(p => p.id === id);
      if (payable) handleEdit(payable);
    };
    
    (window as any).handleDelete = (id: string) => {
      handleDelete(id);
    };
    
    return () => {
      delete (window as any).handleRecordPayment;
      delete (window as any).handleEdit;
      delete (window as any).handleDelete;
    };
  }, [payables]);
  

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load accounts payable. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark">
            <FaFileInvoice className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            Accounts Payable
          </h2>
          <p className="text-muted mb-0">Manage vendor bills, payments, and aging analysis</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="btn btn-success d-flex align-items-center gap-2 px-3"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
          data-testid="button-add-payable"
        >
          <FaPlus size={14} />
          New Bill
        </button>
      </div>

      {/* Aging Analysis Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-success fw-bold">${agingAnalysis.current.amount.toFixed(2)}</div>
              <div className="small text-muted">Current (0-30 days)</div>
              <div className="small text-muted">{agingAnalysis.current.count} bills</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-warning fw-bold">${agingAnalysis.thirtyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">31-60 Days</div>
              <div className="small text-muted">{agingAnalysis.thirtyDays.count} bills</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-danger fw-bold">${agingAnalysis.sixtyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">61-90 Days</div>
              <div className="small text-muted">{agingAnalysis.sixtyDays.count} bills</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-dark fw-bold">${agingAnalysis.ninetyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">90+ Days</div>
              <div className="small text-muted">{agingAnalysis.ninetyDays.count} bills</div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Total Outstanding */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <AnimatedCard>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="h4 mb-1 text-danger fw-bold">${agingAnalysis.total.amount.toFixed(2)}</div>
                <div className="text-muted">Total Outstanding</div>
              </div>
              <div className="text-end">
                <div className="h5 mb-1 text-info fw-bold">{agingAnalysis.total.count}</div>
                <div className="text-muted">Total Bills</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Filters */}
      <AnimatedCard>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-payables"
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              data-testid="select-filter-status"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterAging}
              onChange={(e) => setFilterAging(e.target.value)}
              data-testid="select-filter-aging"
            >
              <option value="">All Ages</option>
              <option value="current">Current (0-30 days)</option>
              <option value="31-60">31-60 Days</option>
              <option value="61-90">61-90 Days</option>
              <option value="90+">90+ Days</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {/* Payables Table */}
      <AnimatedCard>
        <AGDataGrid
          rowData={filteredPayables}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={25}
          height="600px"
          enableExport={true}
          exportFileName="accounts-payable"
          showExportButtons={true}
          enableFiltering={true}
          enableSorting={true}
          enableResizing={true}
          sideBar={false}
        />
      </AnimatedCard>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPayable ? 'Edit Bill' : 'Create New Bill'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Vendor *</label>
                      <select
                        className={`form-select ${errors.vendorId ? 'is-invalid' : ''}`}
                        {...register('vendorId')}
                        data-testid="select-vendor"
                      >
                        <option value="">Select vendor...</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name} {vendor.email && `(${vendor.email})`}
                          </option>
                        ))}
                      </select>
                      {errors.vendorId && (
                        <div className="invalid-feedback">
                          {errors.vendorId?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Purchase Order ID</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('purchaseOrderId')}
                        placeholder="e.g., PO-001"
                        data-testid="input-purchase-order-id"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bill Number *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.billNumber ? 'is-invalid' : ''}`}
                        {...register('billNumber')}
                        placeholder="e.g., BILL-001"
                        data-testid="input-bill-number"
                      />
                      {errors.billNumber && (
                        <div className="invalid-feedback">
                          {errors.billNumber?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Total Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.totalAmount ? 'is-invalid' : ''}`}
                        {...register('totalAmount')}
                        placeholder="0.00"
                        data-testid="input-total-amount"
                      />
                      {errors.totalAmount && (
                        <div className="invalid-feedback">
                          {errors.totalAmount?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bill Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.billDate ? 'is-invalid' : ''}`}
                        {...register('billDate')}
                        data-testid="input-bill-date"
                      />
                      {errors.billDate && (
                        <div className="invalid-feedback">
                          {errors.billDate?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Due Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
                        {...register('dueDate')}
                        data-testid="input-due-date"
                      />
                      {errors.dueDate && (
                        <div className="invalid-feedback">
                          {errors.dueDate?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Terms (Days)</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className={`form-control ${errors.paymentTerms ? 'is-invalid' : ''}`}
                        {...register('paymentTerms')}
                        placeholder="30"
                        data-testid="input-payment-terms"
                      />
                      {errors.paymentTerms && (
                        <div className="invalid-feedback">
                          {errors.paymentTerms?.message}
                        </div>
                      )}
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
                    className="btn btn-primary"
                    disabled={savePayableMutation.isPending}
                    data-testid="button-save-payable"
                  >
                    {savePayableMutation.isPending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      editingPayable ? 'Update Bill' : 'Create Bill'
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

export default AccountsPayable;