import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEye, FaMoneyBillWave, FaCalendarAlt, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedCard from '../components/ui/AnimatedCard';
import DataTable, { type Column } from '../components/ui/DataTable';
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
    queryKey: ['/api/aging-report'],
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
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
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

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      render: (invoice) => (
        <div>
          <div className="fw-bold">{invoice.invoiceNumber}</div>
          <small className="text-muted">{invoice.customerName}</small>
        </div>
      )
    },
    {
      key: 'invoiceDate',
      label: 'Invoice Date',
      render: (invoice) => new Date(invoice.invoiceDate).toLocaleDateString()
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (invoice) => (
        <div>
          <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
          {invoice.daysPastDue && invoice.daysPastDue > 0 && (
            <small className="text-danger">
              <FaExclamationTriangle className="me-1" />
              {invoice.daysPastDue} days overdue
            </small>
          )}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (invoice) => `$${parseFloat(invoice.totalAmount).toFixed(2)}`
    },
    {
      key: 'paidAmount',
      label: 'Paid',
      render: (invoice) => (
        <span className="text-success">
          ${parseFloat(invoice.paidAmount).toFixed(2)}
        </span>
      )
    },
    {
      key: 'outstandingAmount',
      label: 'Outstanding',
      render: (invoice) => (
        <span className={parseFloat(invoice.outstandingAmount) > 0 ? 'text-danger fw-bold' : 'text-muted'}>
          ${parseFloat(invoice.outstandingAmount).toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (invoice) => (
        <span className={`badge ${getStatusBadge(invoice.status, invoice.daysPastDue)}`}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (invoice) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-primary btn-sm"
            data-testid={`button-view-${invoice.id}`}
          >
            <FaEye />
          </button>
          {parseFloat(invoice.outstandingAmount) > 0 && (
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => openPaymentModal(invoice)}
              data-testid={`button-payment-${invoice.id}`}
            >
              <FaMoneyBillWave />
            </button>
          )}
        </div>
      )
    }
  ];

  const agingColumns: Column<AgingReport['customers'][0]>[] = [
    {
      key: 'customerName',
      label: 'Customer',
      render: (customer) => customer.customerName
    },
    {
      key: 'current',
      label: 'Current',
      render: (customer) => `$${parseFloat(customer.current).toFixed(2)}`
    },
    {
      key: 'days30',
      label: '1-30 Days',
      render: (customer) => (
        <span className={parseFloat(customer.days30) > 0 ? 'text-warning' : ''}>
          ${parseFloat(customer.days30).toFixed(2)}
        </span>
      )
    },
    {
      key: 'days60',
      label: '31-60 Days',
      render: (customer) => (
        <span className={parseFloat(customer.days60) > 0 ? 'text-danger' : ''}>
          ${parseFloat(customer.days60).toFixed(2)}
        </span>
      )
    },
    {
      key: 'days90',
      label: '61-90 Days',
      render: (customer) => (
        <span className={parseFloat(customer.days90) > 0 ? 'text-danger fw-bold' : ''}>
          ${parseFloat(customer.days90).toFixed(2)}
        </span>
      )
    },
    {
      key: 'over90',
      label: '90+ Days',
      render: (customer) => (
        <span className={parseFloat(customer.over90) > 0 ? 'bg-danger text-white px-2 py-1 rounded' : ''}>
          ${parseFloat(customer.over90).toFixed(2)}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (customer) => (
        <span className="fw-bold">
          ${parseFloat(customer.total).toFixed(2)}
        </span>
      )
    }
  ];

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
            <DataTable
              data={agingReport.customers}
              columns={agingColumns}
              searchable={true}
              searchPlaceholder="Search customers..."
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
            <DataTable
              data={invoices}
              columns={invoiceColumns}
              searchable={true}
              searchPlaceholder="Search invoices..."
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