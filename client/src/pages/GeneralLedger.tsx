import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaBook, FaSearch, FaFilter, FaDownload, FaPlus, FaEye, FaCalendarAlt, FaFileExport } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Schema for filtering
const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
  transactionType: z.enum(['all', 'debit', 'credit']).default('all'),
  description: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  reference?: string;
  isPosted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  createdAt: string;
}

interface LedgerEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  entryDescription: string;
  reference?: string;
  accountCode: string;
  accountName: string;
  transactionDescription?: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  isPosted: boolean;
}

const GeneralLedger = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  const queryClient = useQueryClient();

  // Form handling for filters
  const { register, handleSubmit, reset, watch } = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      transactionType: 'all'
    }
  });

  const watchedFilters = watch();

  // Fetch accounts for filter dropdown
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch ledger entries with filters
  const { data: ledgerEntries = [], isLoading, error } = useQuery<LedgerEntry[]>({
    queryKey: ['/api/general-ledger', watchedFilters],
    enabled: true
  });

  // Fetch journal entries for modal
  const { data: journalEntries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Export ledger mutation
  const exportLedgerMutation = useMutation({
    mutationFn: async (format: 'csv' | 'excel' | 'pdf') => {
      const response = await fetch(`/api/general-ledger/export?format=${format}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to export ledger');
      return response.blob();
    },
    onSuccess: (blob, format) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `general-ledger.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  // Apply filters
  const onSubmitFilters = (data: FilterFormData) => {
    // Filters are automatically applied via watchedFilters
    setShowFilters(false);
  };

  const clearFilters = () => {
    reset({
      transactionType: 'all'
    });
    setShowFilters(false);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    exportLedgerMutation.mutate(format);
  };

  const handleViewJournalEntry = (entryId: string) => {
    const entry = journalEntries.find(je => je.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setShowJournalModal(true);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'entryDate',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace">${new Date(params.value).toLocaleDateString()}</span>`
    },
    {
      headerName: 'Entry #',
      field: 'entryNumber',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-primary">${params.value}</span>`
    },
    {
      headerName: 'Account',
      field: 'accountCode',
      sortable: true,
      filter: true,
      width: 180,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-semibold text-dark">${params.value}</div>
          <small class="text-muted">${params.data.accountName}</small>
        </div>
      `
    },
    {
      headerName: 'Description',
      field: 'entryDescription',
      sortable: true,
      filter: true,
      width: 250,
      cellRenderer: (params: any) => `
        <div>
          <div>${params.value}</div>
          ${params.data.transactionDescription && params.data.transactionDescription !== params.value ? 
            `<small class="text-muted">${params.data.transactionDescription}</small>` : ''}
          ${params.data.reference ? 
            `<small class="text-info d-block">Ref: ${params.data.reference}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'Debit',
      field: 'debitAmount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const isPositive = params.value > 0;
        const formatted = isPositive ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value) : '-';
        return `<span class="font-monospace ${isPositive ? 'text-success fw-semibold' : 'text-muted'}">${formatted}</span>`;
      }
    },
    {
      headerName: 'Credit',
      field: 'creditAmount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const isPositive = params.value > 0;
        const formatted = isPositive ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value) : '-';
        return `<span class="font-monospace ${isPositive ? 'text-danger fw-semibold' : 'text-muted'}">${formatted}</span>`;
      }
    },
    {
      headerName: 'Balance',
      field: 'balance',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params.value);
        return `<span class="font-monospace fw-bold ${params.value >= 0 ? 'text-success' : 'text-danger'}">${formatted}</span>`;
      }
    },
    {
      headerName: 'Status',
      field: 'isPosted',
      sortable: true,
      filter: true,
      width: 150,
      cellRenderer: (params: any) => `
        <div class="d-flex align-items-center gap-2">
          <span class="badge ${params.value ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">
            ${params.value ? 'Posted' : 'Draft'}
          </span>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            onclick="window.handleViewJournalEntry('${params.data.id}')"
            title="View Journal Entry"
            data-testid="button-view-entry-${params.data.id}"
          >
            <i class="fas fa-eye"></i>
          </button>
        </div>
      `
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleViewJournalEntry = (id: string) => {
      handleViewJournalEntry(id);
    };
    
    return () => {
      delete (window as any).handleViewJournalEntry;
    };
  }, [ledgerEntries]);

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalDebits = ledgerEntries.reduce((sum, entry) => sum + entry.debitAmount, 0);
    const totalCredits = ledgerEntries.reduce((sum, entry) => sum + entry.creditAmount, 0);
    const netBalance = totalDebits - totalCredits;
    return { totalDebits, totalCredits, netBalance };
  }, [ledgerEntries]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load general ledger. Please try again.
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
            <FaBook className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            General Ledger
          </h2>
          <p className="text-muted mb-0">Complete record of all accounting transactions</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center gap-2 px-3`}
            data-testid="button-toggle-filters"
          >
            <FaFilter size={14} />
            Filters
          </button>
          <div className="dropdown">
            <button
              className="btn btn-success dropdown-toggle d-flex align-items-center gap-2 px-3"
              type="button"
              data-bs-toggle="dropdown"
              style={{ 
                background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
                border: 'none'
              }}
              data-testid="dropdown-export"
            >
              <FaDownload size={14} />
              Export
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleExport('csv')}
                  disabled={exportLedgerMutation.isPending}
                  data-testid="button-export-csv"
                >
                  <FaFileExport className="me-2" />
                  Export as CSV
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleExport('excel')}
                  disabled={exportLedgerMutation.isPending}
                  data-testid="button-export-excel"
                >
                  <FaFileExport className="me-2" />
                  Export as Excel
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => handleExport('pdf')}
                  disabled={exportLedgerMutation.isPending}
                  data-testid="button-export-pdf"
                >
                  <FaFileExport className="me-2" />
                  Export as PDF
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-success fw-bold">{formatCurrency(totals.totalDebits)}</div>
              <div className="small text-muted">Total Debits</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-danger fw-bold">{formatCurrency(totals.totalCredits)}</div>
              <div className="small text-muted">Total Credits</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className={`h4 mb-1 fw-bold ${totals.netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(totals.netBalance)}
              </div>
              <div className="small text-muted">Net Balance</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-primary fw-bold">{ledgerEntries.length}</div>
              <div className="small text-muted">Total Entries</div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <AnimatedCard className="mb-4">
          <form onSubmit={handleSubmit(onSubmitFilters)}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  {...register('startDate')}
                  data-testid="input-start-date"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  {...register('endDate')}
                  data-testid="input-end-date"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Account</label>
                <select
                  className="form-select"
                  {...register('accountId')}
                  data-testid="select-account"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountCode} - {account.accountName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Transaction Type</label>
                <select
                  className="form-select"
                  {...register('transactionType')}
                  data-testid="select-transaction-type"
                >
                  <option value="all">All Transactions</option>
                  <option value="debit">Debits Only</option>
                  <option value="credit">Credits Only</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label">Description Contains</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search in descriptions..."
                  {...register('description')}
                  data-testid="input-description-filter"
                />
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                data-testid="button-apply-filters"
              >
                <FaSearch className="me-2" />
                Apply Filters
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </AnimatedCard>
      )}

      {/* Ledger Table */}
      <AnimatedCard>
        <AGDataGrid
          rowData={ledgerEntries}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={25}
          height="600px"
          enableExport={true}
          exportFileName="general-ledger"
          showExportButtons={false}
          enableFiltering={true}
          enableSorting={true}
          enableResizing={true}
          sideBar={false}
        />
      </AnimatedCard>

      {/* Journal Entry Modal */}
      {showJournalModal && selectedEntry && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Journal Entry {selectedEntry.entryNumber}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowJournalModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Entry Date:</strong> {new Date(selectedEntry.entryDate).toLocaleDateString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${selectedEntry.isPosted ? 'bg-success' : 'bg-warning'}`}>
                      {selectedEntry.isPosted ? 'Posted' : 'Draft'}
                    </span>
                  </div>
                  <div className="col-12 mt-2">
                    <strong>Description:</strong> {selectedEntry.description}
                  </div>
                  {selectedEntry.reference && (
                    <div className="col-12 mt-2">
                      <strong>Reference:</strong> {selectedEntry.reference}
                    </div>
                  )}
                </div>
                
                <h6>Transaction Details:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Account Code</th>
                        <th>Account Name</th>
                        <th>Description</th>
                        <th className="text-end">Debit</th>
                        <th className="text-end">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* This would be populated with actual transaction data */}
                      <tr>
                        <td colSpan={5} className="text-center text-muted">
                          Transaction details would be loaded here
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowJournalModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;