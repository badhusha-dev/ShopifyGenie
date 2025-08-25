import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileInvoiceDollar, FaSearch, FaFilter, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import DataTable, { type Column } from '../components/ui/DataTable';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Schema
const receivableSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  orderId: z.string().optional(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalAmount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentTerms: z.coerce.number().min(1).max(365).default(30),
});

type ReceivableFormData = z.infer<typeof receivableSchema>;

interface AccountsReceivable {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  invoiceNumber: string;
  invoiceDate: string;
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

interface Customer {
  id: string;
  name: string;
  email: string;
}

const AccountsReceivable = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<AccountsReceivable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAging, setFilterAging] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch accounts receivable
  const { data: receivables = [], isLoading, error } = useQuery<AccountsReceivable[]>({
    queryKey: ['/api/accounts-receivable'],
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Create/Update receivable mutation
  const saveReceivableMutation = useMutation({
    mutationFn: async (data: ReceivableFormData) => {
      const payload = {
        ...data,
        outstandingAmount: data.totalAmount, // Initially equals total amount
      };

      if (editingReceivable) {
        const response = await fetch(`/api/accounts-receivable/${editingReceivable.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update receivable');
        return response.json();
      } else {
        const response = await fetch('/api/accounts-receivable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create receivable');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-receivable'] });
      setShowModal(false);
      setEditingReceivable(null);
      reset();
    },
  });

  // Payment recording mutation
  const recordPaymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const response = await fetch(`/api/accounts-receivable/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Failed to record payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-receivable'] });
    },
  });

  // Delete receivable mutation
  const deleteReceivableMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accounts-receivable/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete receivable');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts-receivable'] });
    },
  });

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ReceivableFormData>({
    resolver: zodResolver(receivableSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().split('T')[0],
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

    receivables.forEach((receivable: AccountsReceivable) => {
      const outstanding = parseFloat(receivable.outstandingAmount);
      if (outstanding <= 0) return;

      buckets.total.count++;
      buckets.total.amount += outstanding;

      const daysPastDue = receivable.daysPastDue || 0;
      
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
  }, [receivables]);

  // Filter receivables
  const filteredReceivables = receivables.filter((receivable: AccountsReceivable) => {
    const matchesSearch = 
      receivable.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receivable.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || receivable.status === filterStatus;
    
    let matchesAging = true;
    if (filterAging) {
      const daysPastDue = receivable.daysPastDue || 0;
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

  const handleEdit = (receivable: AccountsReceivable) => {
    setEditingReceivable(receivable);
    setValue('customerId', receivable.customerId);
    setValue('orderId', receivable.orderId || '');
    setValue('invoiceNumber', receivable.invoiceNumber);
    setValue('invoiceDate', receivable.invoiceDate.split('T')[0]);
    setValue('dueDate', receivable.dueDate.split('T')[0]);
    setValue('totalAmount', parseFloat(receivable.totalAmount));
    setValue('paymentTerms', receivable.paymentTerms);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingReceivable(null);
    reset({
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 30
    });
    setShowModal(true);
  };

  const onSubmit = (data: ReceivableFormData) => {
    saveReceivableMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this receivable?')) {
      deleteReceivableMutation.mutate(id);
    }
  };

  const handleRecordPayment = (receivable: AccountsReceivable) => {
    const amount = prompt(`Record payment for Invoice ${receivable.invoiceNumber}\nOutstanding: $${receivable.outstandingAmount}\n\nEnter payment amount:`);
    if (amount && !isNaN(parseFloat(amount))) {
      const paymentAmount = parseFloat(amount);
      if (paymentAmount > 0 && paymentAmount <= parseFloat(receivable.outstandingAmount)) {
        recordPaymentMutation.mutate({ id: receivable.id, amount: paymentAmount });
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
      overdue: { bg: 'danger', text: 'Overdue' },
      written_off: { bg: 'secondary', text: 'Written Off' }
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

  // DataTable columns
  const columns: Column[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-monospace fw-bold text-primary">{value}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="fw-semibold">{value}</div>
          <small className="text-muted">{row.customerEmail}</small>
        </div>
      )
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      width: '120px',
      render: (value, row) => {
        const isOverdue = row.daysPastDue > 0 && row.status !== 'paid';
        return (
          <div className={isOverdue ? 'text-danger' : ''}>
            {new Date(value).toLocaleDateString()}
            {isOverdue && <FaExclamationTriangle className="ms-1" size={12} />}
          </div>
        );
      }
    },
    {
      key: 'totalAmount',
      label: 'Total',
      width: '100px',
      render: (value) => (
        <span className="font-monospace">${parseFloat(value).toFixed(2)}</span>
      )
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      width: '120px',
      render: (value) => (
        <span className="font-monospace fw-bold text-warning">
          ${parseFloat(value).toFixed(2)}
        </span>
      )
    },
    {
      key: 'daysPastDue',
      label: 'Aging',
      width: '100px',
      render: (value) => {
        const aging = getAgingBadge(value || 0);
        return (
          <span className={`badge bg-${aging.bg} bg-opacity-10 text-${aging.bg} border border-${aging.bg} border-opacity-25`}>
            {aging.text}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      render: (_, row) => (
        <div className="d-flex gap-1">
          {row.status !== 'paid' && parseFloat(row.outstandingAmount) > 0 && (
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => handleRecordPayment(row)}
              data-testid={`button-pay-${row.id}`}
              title="Record Payment"
            >
              $
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleEdit(row)}
            data-testid={`button-edit-${row.id}`}
            title="Edit"
          >
            <FaEdit size={12} />
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleDelete(row.id)}
            data-testid={`button-delete-${row.id}`}
            title="Delete"
          >
            <FaTrash size={12} />
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load accounts receivable. Please try again.
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
            <FaFileInvoiceDollar className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            Accounts Receivable
          </h2>
          <p className="text-muted mb-0">Manage customer invoices, payments, and aging analysis</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="btn btn-success d-flex align-items-center gap-2 px-3"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
          data-testid="button-add-receivable"
        >
          <FaPlus size={14} />
          New Invoice
        </button>
      </div>

      {/* Aging Analysis Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-success fw-bold">${agingAnalysis.current.amount.toFixed(2)}</div>
              <div className="small text-muted">Current (0-30 days)</div>
              <div className="small text-muted">{agingAnalysis.current.count} invoices</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-warning fw-bold">${agingAnalysis.thirtyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">31-60 Days</div>
              <div className="small text-muted">{agingAnalysis.thirtyDays.count} invoices</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-danger fw-bold">${agingAnalysis.sixtyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">61-90 Days</div>
              <div className="small text-muted">{agingAnalysis.sixtyDays.count} invoices</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h5 mb-1 text-dark fw-bold">${agingAnalysis.ninetyDays.amount.toFixed(2)}</div>
              <div className="small text-muted">90+ Days</div>
              <div className="small text-muted">{agingAnalysis.ninetyDays.count} invoices</div>
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
                <div className="h4 mb-1 text-primary fw-bold">${agingAnalysis.total.amount.toFixed(2)}</div>
                <div className="text-muted">Total Outstanding</div>
              </div>
              <div className="text-end">
                <div className="h5 mb-1 text-info fw-bold">{agingAnalysis.total.count}</div>
                <div className="text-muted">Total Invoices</div>
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
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-receivables"
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
              <option value="written_off">Written Off</option>
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

      {/* Receivables Table */}
      <AnimatedCard>
        <DataTable
          columns={columns}
          data={filteredReceivables}
          loading={isLoading}
          emptyMessage="No receivables found"
          className="table-hover"
        />
      </AnimatedCard>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingReceivable ? 'Edit Invoice' : 'Create New Invoice'}
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
                      <label className="form-label">Customer *</label>
                      <select
                        className={`form-select ${errors.customerId ? 'is-invalid' : ''}`}
                        {...register('customerId')}
                        data-testid="select-customer"
                      >
                        <option value="">Select customer...</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </select>
                      {errors.customerId && (
                        <div className="invalid-feedback">
                          {errors.customerId?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Order ID</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('orderId')}
                        placeholder="e.g., ORD-001"
                        data-testid="input-order-id"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Invoice Number *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.invoiceNumber ? 'is-invalid' : ''}`}
                        {...register('invoiceNumber')}
                        placeholder="e.g., INV-001"
                        data-testid="input-invoice-number"
                      />
                      {errors.invoiceNumber && (
                        <div className="invalid-feedback">
                          {errors.invoiceNumber?.message}
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
                      <label className="form-label">Invoice Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.invoiceDate ? 'is-invalid' : ''}`}
                        {...register('invoiceDate')}
                        data-testid="input-invoice-date"
                      />
                      {errors.invoiceDate && (
                        <div className="invalid-feedback">
                          {errors.invoiceDate?.message}
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
                    disabled={saveReceivableMutation.isPending}
                    data-testid="button-save-receivable"
                  >
                    {saveReceivableMutation.isPending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      editingReceivable ? 'Update Invoice' : 'Create Invoice'
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

export default AccountsReceivable;