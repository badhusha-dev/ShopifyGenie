import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileInvoiceDollar, FaSearch, FaFilter, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
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
    queryKey: ['/accounts-receivable'],
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/customers'],
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
      queryClient.invalidateQueries({ queryKey: ['/accounts-receivable'] });
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
      queryClient.invalidateQueries({ queryKey: ['/accounts-receivable'] });
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
      queryClient.invalidateQueries({ queryKey: ['/accounts-receivable'] });
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

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Invoice #',
      field: 'invoiceNumber',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-primary">${params.value}</span>`
    },
    {
      headerName: 'Customer',
      field: 'customerName',
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params: any) => 
        `<div>
          <div class="fw-semibold">${params.data.customerName}</div>
          <small class="text-muted">${params.data.customerEmail}</small>
        </div>`
    },
    {
      headerName: 'Invoice Date',
      field: 'invoiceDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 120,
      valueGetter: (params) => new Date(params.data.invoiceDate).toLocaleDateString()
    },
    {
      headerName: 'Due Date',
      field: 'dueDate',
      sortable: true,
      filter: 'agDateColumnFilter',
      width: 120,
      cellRenderer: (params: any) => {
        const isOverdue = params.data.daysPastDue > 0 && params.data.status !== 'paid';
        const dateStr = new Date(params.data.dueDate).toLocaleDateString();
        return isOverdue 
          ? `<div class="text-danger">${dateStr} <i class="fas fa-exclamation-triangle ms-1"></i></div>`
          : dateStr;
      }
    },
    {
      headerName: 'Total',
      field: 'totalAmount',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      valueGetter: (params) => `$${parseFloat(params.data.totalAmount).toFixed(2)}`
    },
    {
      headerName: 'Outstanding',
      field: 'outstandingAmount',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-warning">$${parseFloat(params.data.outstandingAmount).toFixed(2)}</span>`
    },
    {
      headerName: 'Aging',
      field: 'daysPastDue',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 100,
      cellRenderer: (params: any) => {
        const value = params.data.daysPastDue || 0;
        const aging = getAgingBadge(value);
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
          overdue: { bg: 'danger', text: 'Overdue' },
          written_off: { bg: 'secondary', text: 'Written Off' }
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
      cellRenderer: (params: any) => {
        const row = params.data;
        const canPay = row.status !== 'paid' && parseFloat(row.outstandingAmount) > 0;
        return `
          <div class="d-flex gap-1">
            ${canPay ? `<button type="button" class="btn btn-outline-success btn-sm" onclick="handleRecordPaymentAR('${row.id}')" title="Record Payment">$</button>` : ''}
            <button type="button" class="btn btn-outline-primary btn-sm" onclick="handleEditReceivable('${row.id}')" title="Edit">
              <i class="fas fa-edit" style="font-size: 12px;"></i>
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="handleDeleteReceivable('${row.id}')" title="Delete">
              <i class="fas fa-trash" style="font-size: 12px;"></i>
            </button>
          </div>
        `;
      },
      pinned: 'right'
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleRecordPaymentAR = (id: string) => {
      const receivable = receivables.find(r => r.id === id);
      if (receivable) handleRecordPayment(receivable);
    };
    (window as any).handleEditReceivable = (id: string) => {
      const receivable = receivables.find(r => r.id === id);
      if (receivable) handleEdit(receivable);
    };
    (window as any).handleDeleteReceivable = (id: string) => {
      handleDelete(id);
    };
  }, [receivables]);

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
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark fw-bold gradient-text">
            <FaFileInvoiceDollar className="me-2" style={{ color: 'var(--shopify-green)' }} />
            Accounts Receivable
          </h2>
          <p className="text-muted mb-0">Manage customer invoices, payments, and aging analysis</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-ripple hover-lift"
          data-testid="button-new-receivable"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
        >
          <FaPlus size={14} />
          New Invoice
        </button>
      </div>

      {/* Enhanced Aging Analysis Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-success" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-success bg-opacity-10 rounded-3">
                  <i className="fas fa-check-circle fs-4 text-success"></i>
                </div>
                <div className="text-end">
                  <div className="small text-muted">0-30 days</div>
                  <div className="badge bg-success bg-opacity-10 text-success">Current</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-success fw-bold" data-testid="text-current-amount">
                  ${agingAnalysis.current.amount.toFixed(2)}
                </div>
                <div className="text-muted small">{agingAnalysis.current.count} invoices</div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => setFilterAging('current')}
                  data-testid="button-filter-current"
                >
                  View Details
                </button>
                <div className="text-success small fw-semibold">
                  {receivables.length > 0 ? 
                    ((agingAnalysis.current.amount / receivables.reduce((sum, r) => sum + parseFloat(r.outstandingAmount), 0)) * 100).toFixed(1) 
                    : 0}%
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-warning" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                  <i className="fas fa-clock fs-4 text-warning"></i>
                </div>
                <div className="text-end">
                  <div className="small text-muted">31-60 days</div>
                  <div className="badge bg-warning bg-opacity-10 text-warning">Watch</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-warning fw-bold" data-testid="text-thirty-days-amount">
                  ${agingAnalysis.thirtyDays.amount.toFixed(2)}
                </div>
                <div className="text-muted small">{agingAnalysis.thirtyDays.count} invoices</div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <button 
                  className="btn btn-outline-warning btn-sm"
                  onClick={() => setFilterAging('31-60')}
                  data-testid="button-filter-thirty-days"
                >
                  View Details
                </button>
                <div className="text-warning small fw-semibold">
                  {receivables.length > 0 ? 
                    ((agingAnalysis.thirtyDays.amount / receivables.reduce((sum, r) => sum + parseFloat(r.outstandingAmount), 0)) * 100).toFixed(1) 
                    : 0}%
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-danger" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                  <i className="fas fa-exclamation-triangle fs-4 text-danger"></i>
                </div>
                <div className="text-end">
                  <div className="small text-muted">61-90 days</div>
                  <div className="badge bg-danger bg-opacity-10 text-danger">Risk</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-danger fw-bold" data-testid="text-sixty-days-amount">
                  ${agingAnalysis.sixtyDays.amount.toFixed(2)}
                </div>
                <div className="text-muted small">{agingAnalysis.sixtyDays.count} invoices</div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setFilterAging('61-90')}
                  data-testid="button-filter-sixty-days"
                >
                  View Details
                </button>
                <div className="text-danger small fw-semibold">
                  {receivables.length > 0 ? 
                    ((agingAnalysis.sixtyDays.amount / receivables.reduce((sum, r) => sum + parseFloat(r.outstandingAmount), 0)) * 100).toFixed(1) 
                    : 0}%
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-dark" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-dark bg-opacity-10 rounded-3">
                  <i className="fas fa-times-circle fs-4 text-dark"></i>
                </div>
                <div className="text-end">
                  <div className="small text-muted">90+ days</div>
                  <div className="badge bg-dark bg-opacity-10 text-dark">Critical</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-dark fw-bold" data-testid="text-ninety-days-amount">
                  ${agingAnalysis.ninetyDays.amount.toFixed(2)}
                </div>
                <div className="text-muted small">{agingAnalysis.ninetyDays.count} invoices</div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <button 
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => setFilterAging('90+')}
                  data-testid="button-filter-ninety-days"
                >
                  View Details
                </button>
                <div className="text-dark small fw-semibold">
                  {receivables.length > 0 ? 
                    ((agingAnalysis.ninetyDays.amount / receivables.reduce((sum, r) => sum + parseFloat(r.outstandingAmount), 0)) * 100).toFixed(1) 
                    : 0}%
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Summary Overview Card */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <AnimatedCard className="border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="card-title mb-0 fw-bold text-primary">
                  <i className="fas fa-chart-line me-2"></i>
                  Outstanding Balance Summary
                </h5>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => { setFilterAging(''); setFilterStatus(''); setSearchTerm(''); }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </button>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-3 bg-primary bg-opacity-5 rounded-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded-3 me-3">
                      <i className="fas fa-dollar-sign fs-4 text-primary"></i>
                    </div>
                    <div>
                      <div className="h4 mb-1 text-primary fw-bold" data-testid="text-total-outstanding">
                        ${agingAnalysis.total.amount.toFixed(2)}
                      </div>
                      <div className="text-muted small">Total Outstanding</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-center p-3 bg-info bg-opacity-5 rounded-3">
                    <div className="p-3 bg-info bg-opacity-10 rounded-3 me-3">
                      <i className="fas fa-file-invoice fs-4 text-info"></i>
                    </div>
                    <div>
                      <div className="h4 mb-1 text-info fw-bold" data-testid="text-total-invoices">
                        {agingAnalysis.total.count}
                      </div>
                      <div className="text-muted small">Total Invoices</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-lg-4">
          <AnimatedCard className="border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h6 className="card-title mb-3 fw-bold text-muted">Quick Actions</h6>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
                  data-testid="button-export-data"
                >
                  <i className="fas fa-download me-2"></i>
                  Export Report
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                  data-testid="button-send-reminders"
                >
                  <i className="fas fa-envelope me-2"></i>
                  Send Reminders
                </button>
                <button 
                  className="btn btn-outline-warning btn-sm d-flex align-items-center justify-content-center"
                  data-testid="button-aging-analysis"
                >
                  <i className="fas fa-chart-bar me-2"></i>
                  Detailed Analysis
                </button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Enhanced Filters */}
      <AnimatedCard className="border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="fas fa-filter me-2 text-primary"></i>
              Filter & Search
            </h6>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-10 text-primary" data-testid="text-filtered-count">
                {filteredReceivables.length} of {receivables.length} invoices
              </span>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-lg-4 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">Search Invoices</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-2"
                  placeholder="Invoice #, customer name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-receivables"
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">Status Filter</label>
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
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-semibold text-muted mb-2">Aging Filter</label>
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
            <div className="col-lg-2 col-md-6 d-flex align-items-end">
              <div className="d-grid w-100">
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => { setFilterAging(''); setFilterStatus(''); setSearchTerm(''); }}
                  data-testid="button-reset-filters"
                >
                  <i className="fas fa-undo me-1"></i>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Enhanced Receivables Table */}
      <AnimatedCard className="border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
            <h6 className="card-title mb-0 fw-bold text-dark">
              <i className="fas fa-table me-2 text-primary"></i>
              Accounts Receivable
            </h6>
            <div className="d-flex align-items-center gap-2">
              {filterAging && (
                <span className="badge bg-warning bg-opacity-10 text-warning">
                  Filtered by: {filterAging === 'current' ? 'Current (0-30)' : filterAging === '31-60' ? '31-60 days' : filterAging === '61-90' ? '61-90 days' : '90+ days'}
                </span>
              )}
              {filterStatus && (
                <span className="badge bg-info bg-opacity-10 text-info">
                  Status: {filterStatus}
                </span>
              )}
            </div>
          </div>
          <AGDataGrid
            rowData={filteredReceivables || []}
            columnDefs={columnDefs}
            loading={isLoading}
            pagination={true}
            paginationPageSize={20}
            height="500px"
            enableExport={true}
            exportFileName="accounts-receivable"
            showExportButtons={true}
            enableFiltering={true}
            enableSorting={true}
            enableResizing={true}
          />
        </div>
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