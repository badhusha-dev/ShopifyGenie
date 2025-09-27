import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEye, FaMoneyBillWave, FaCalendarAlt, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedCard from '../components/ui/AnimatedCard';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import { designTokens } from '../design/tokens';
import { apiRequest } from '../lib/queryClient';

// Form Schema
const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  paidAmount: string;
  outstandingAmount: string;
  status: string;
  paymentTerms: number;
  daysPastDue?: number;
}

interface AgingReport {
  asOfDate: string;
  totalOutstanding: string;
  aging: Array<{
    range: string;
    amount: string;
    count: number;
  }>;
  customers: Array<{
    customerId: string;
    customerName: string;
    current: string;
    days30: string;
    days60: string;
    days90: string;
    over90: string;
    total: string;
  }>;
}

const InvoiceManagement = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [showAgingReport, setShowAgingReport] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices', { status: statusFilter, overdue: overdueOnly }],
  });

  // Fetch aging report
  const { data: agingReport, isLoading: loadingAging } = useQuery<AgingReport>({
    queryKey: ['/aging-report'],
    enabled: showAgingReport,
  });

  // Record payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData & { invoiceId: string }) => {
      const { invoiceId, ...paymentData } = data;
      return apiRequest(`/api/invoices/${invoiceId}/payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/invoices'] });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      reset();
    },
  });

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'check'
    }
  });

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const onSubmitPayment = (data: PaymentFormData) => {
    if (selectedInvoice) {
      paymentMutation.mutate({ ...data, invoiceId: selectedInvoice.id });
    }
  };

  const getStatusBadge = (status: string, daysPastDue?: number) => {
    if (status === 'paid') return 'bg-success';
    if (status === 'partial') return 'bg-warning';
    if (daysPastDue && daysPastDue > 0) return 'bg-danger';
    return 'bg-primary';
  };

  // AG-Grid Column Definitions for Invoices
  const invoiceColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Invoice #',
      field: 'invoiceNumber',
      sortable: true,
      filter: true,
      width: 180,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-bold">${params.value}</div>
          <small class="text-muted">${params.data.customerName}</small>
        </div>
      `
    },
    {
      headerName: 'Invoice Date',
      field: 'invoiceDate',
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
      width: 140,
      cellRenderer: (params: any) => {
        const dueDate = new Date(params.value).toLocaleDateString();
        const daysPastDue = params.data.daysPastDue;
        const overdue = daysPastDue && daysPastDue > 0 ? 
          `<small class="text-danger"><i class="fas fa-exclamation-triangle me-1"></i>${daysPastDue} days overdue</small>` : '';
        return `<div><div>${dueDate}</div>${overdue}</div>`;
      }
    },
    {
      headerName: 'Total',
      field: 'totalAmount',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => `$${parseFloat(params.value).toFixed(2)}`
    },
    {
      headerName: 'Paid',
      field: 'paidAmount',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="text-success">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Outstanding',
      field: 'outstandingAmount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.value);
        const className = amount > 0 ? 'text-danger fw-bold' : 'text-muted';
        return `<span class="${className}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        // Simple status badge logic
        const statusClass = params.value === 'paid' ? 'bg-success' : 
                           params.value === 'pending' ? 'bg-warning' : 'bg-secondary';
        const statusText = params.value.charAt(0).toUpperCase() + params.value.slice(1);
        return `<span class="badge ${statusClass}">${statusText}</span>`;
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      cellRenderer: (params: any) => {
        const hasOutstanding = parseFloat(params.data.outstandingAmount) > 0;
        return `
          <div class="d-flex gap-1">
            <button
              class="btn btn-outline-primary btn-sm"
              onclick="window.handleViewInvoice('${params.data.id}')"
              data-testid="button-view-${params.data.id}"
              title="View"
            >
              <i class="fas fa-eye"></i>
            </button>
            ${hasOutstanding ? `
              <button
                class="btn btn-outline-success btn-sm"
                onclick="window.handlePaymentModal('${params.data.id}')"
                data-testid="button-payment-${params.data.id}"
                title="Payment"
              >
                <i class="fas fa-money-bill-wave"></i>
              </button>
            ` : ''}
          </div>
        `;
      }
    }
  ], []);

  // AG-Grid Column Definitions for Aging Report
  const agingColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Customer',
      field: 'customerName',
      sortable: true,
      filter: true,
      width: 200
    },
    {
      headerName: 'Current',
      field: 'current',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => `$${parseFloat(params.value).toFixed(2)}`
    },
    {
      headerName: '1-30 Days',
      field: 'days30',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.value);
        const className = amount > 0 ? 'text-warning' : '';
        return `<span class="${className}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: '31-60 Days',
      field: 'days60',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.value);
        const className = amount > 0 ? 'text-danger' : '';
        return `<span class="${className}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: '61-90 Days',
      field: 'days90',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.value);
        const className = amount > 0 ? 'text-danger fw-bold' : '';
        return `<span class="${className}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: '90+ Days',
      field: 'over90',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.value);
        const className = amount > 0 ? 'bg-danger text-white px-2 py-1 rounded' : '';
        return `<span class="${className}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: 'Total',
      field: 'total',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="fw-bold">$${parseFloat(params.value).toFixed(2)}</span>`
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleViewInvoice = (invoiceId: string) => {
      console.log('View invoice:', invoiceId);
      // Add view logic here
    };
    
    (window as any).handlePaymentModal = (invoiceId: string) => {
      const invoice = invoices?.find((inv: Invoice) => inv.id === invoiceId);
      if (invoice) openPaymentModal(invoice);
    };
    
    return () => {
      delete (window as any).handleViewInvoice;
      delete (window as any).handlePaymentModal;
    };
  }, [invoices]);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ color: designTokens.colors.primary }}>
            <FaFileInvoiceDollar className="me-2" />
            Invoice Management
          </h2>
          <p className="text-muted mt-1">Manage customer invoices and track accounts receivable</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-info"
            onClick={() => setShowAgingReport(!showAgingReport)}
            data-testid="button-aging-report"
          >
            <FaCalendarAlt className="me-2" />
            {showAgingReport ? 'Hide' : 'Show'} Aging Report
          </button>
          <button
            className="btn btn-primary"
            data-testid="button-new-invoice"
          >
            <FaPlus className="me-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Aging Report */}
      {showAgingReport && agingReport && (
        <AnimatedCard className="mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              Accounts Receivable Aging Report
              <small className="ms-2 opacity-75">
                As of {new Date(agingReport.asOfDate).toLocaleDateString()}
              </small>
            </h5>
          </div>
          <div className="card-body">
            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-2">
                <div className="card border-primary">
                  <div className="card-body text-center">
                    <h4 className="text-primary mb-0">
                      ${parseFloat(agingReport.totalOutstanding).toFixed(0)}
                    </h4>
                    <small className="text-muted">Total Outstanding</small>
                  </div>
                </div>
              </div>
              {agingReport.aging.map((bucket, index) => (
                <div key={bucket.range} className="col-md-2">
                  <div className={`card border-${index === 0 ? 'success' : index < 3 ? 'warning' : 'danger'}`}>
                    <div className="card-body text-center">
                      <h5 className={`text-${index === 0 ? 'success' : index < 3 ? 'warning' : 'danger'} mb-0`}>
                        ${parseFloat(bucket.amount).toFixed(0)}
                      </h5>
                      <small className="text-muted">{bucket.range}</small>
                      <div className="small text-muted">({bucket.count} invoices)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Customer Aging */}
            <h6>Customer Breakdown:</h6>
            <AGDataGrid
              rowData={agingReport.customers}
              columnDefs={agingColumnDefs}
              loading={false}
              pagination={true}
              paginationPageSize={10}
              height="350px"
              enableExport={false}
              showExportButtons={true}
              enableFiltering={true}
              enableSorting={true}
              enableResizing={true}
              sideBar={false}
            />
          </div>
        </AnimatedCard>
      )}

      {/* Filters */}
      <AnimatedCard className="mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label className="form-label">Status Filter</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                data-testid="select-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={(e) => setOverdueOnly(e.target.checked)}
                  id="overdueFilter"
                  data-testid="checkbox-overdue-only"
                />
                <label className="form-check-label" htmlFor="overdueFilter">
                  Show overdue only
                </label>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Invoices Table */}
      <AnimatedCard>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Customer Invoices</h5>
        </div>
        <div className="card-body">
          {loadingInvoices ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <AGDataGrid
              rowData={invoices}
              columnDefs={invoiceColumnDefs}
              loading={false}
              pagination={true}
              paginationPageSize={20}
              height="500px"
              enableExport={true}
              exportFileName="invoices"
              showExportButtons={true}
              enableFiltering={true}
              enableSorting={true}
              enableResizing={true}
              sideBar={false}
            />
          )}
        </div>
      </AnimatedCard>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">Record Payment</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPaymentModal(false)}
                  data-testid="button-close-payment-modal"
                />
              </div>
              <form onSubmit={handleSubmit(onSubmitPayment)}>
                <div className="modal-body">
                  {/* Invoice Info */}
                  <div className="alert alert-info">
                    <strong>Invoice:</strong> {selectedInvoice.invoiceNumber} - {selectedInvoice.customerName}
                    <br />
                    <strong>Outstanding Amount:</strong> ${parseFloat(selectedInvoice.outstandingAmount).toFixed(2)}
                  </div>

                  {/* Payment Form */}
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Payment Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        max={selectedInvoice.outstandingAmount}
                        className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                        placeholder="0.00"
                        {...register('amount')}
                        data-testid="input-payment-amount"
                      />
                      {errors.amount && (
                        <div className="invalid-feedback">{errors.amount.message}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.paymentDate ? 'is-invalid' : ''}`}
                        {...register('paymentDate')}
                        data-testid="input-payment-date"
                      />
                      {errors.paymentDate && (
                        <div className="invalid-feedback">{errors.paymentDate.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className={`form-select ${errors.paymentMethod ? 'is-invalid' : ''}`}
                        {...register('paymentMethod')}
                        data-testid="select-payment-method"
                      >
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                        <option value="wire">Wire Transfer</option>
                        <option value="ach">ACH</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                      {errors.paymentMethod && (
                        <div className="invalid-feedback">{errors.paymentMethod.message}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Payment notes..."
                        {...register('notes')}
                        data-testid="textarea-payment-notes"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPaymentModal(false)}
                    data-testid="button-cancel-payment"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={paymentMutation.isPending}
                    data-testid="button-record-payment"
                  >
                    <FaMoneyBillWave className="me-2" />
                    {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
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

export default InvoiceManagement;