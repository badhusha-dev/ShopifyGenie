import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPen, FaSearch, FaFilter, FaCheck, FaTimes, FaBook, FaBalanceScale } from 'react-icons/fa';
import DataTable, { type Column } from '../components/ui/DataTable';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedModal from '../components/ui/AnimatedModal';
import { designTokens } from '../design/tokens';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../hooks/use-toast';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Form Schema for Journal Entry
const journalEntryLineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z.string().optional(),
  debitAmount: z.coerce.number().min(0).optional(),
  creditAmount: z.coerce.number().min(0).optional(),
});

const journalEntrySchema = z.object({
  transactionDate: z.string().min(1, "Transaction date is required"),
  reference: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  lines: z.array(journalEntryLineSchema).min(2, "At least 2 lines required")
}).refine((data) => {
  const totalDebits = data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredits = data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
  message: "Debits must equal credits",
  path: ["lines"]
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface JournalEntry {
  id: string;
  journalNumber: string;
  transactionDate: string;
  reference?: string;
  description: string;
  totalDebit: string;
  totalCredit: string;
  status: string;
  createdBy: string;
  postedBy?: string;
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  isActive: boolean;
}

const JournalEntries = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { toast } = useToast();
  
  // Page load animation
  useEffect(() => {
    setIsPageLoading(false);
  }, []);
  
  const queryClient = useQueryClient();

  // Fetch journal entries
  const { data: journalEntries = [], isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Fetch accounts for dropdown
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Filter active accounts for dropdown
  const activeAccounts = accounts.filter(account => account.isActive);

  // Create/Update journal entry mutation
  const saveJournalEntryMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      const payload = {
        ...data,
        totalDebit: data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0),
        totalCredit: data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0),
      };

      if (editingEntry) {
        const response = await fetch(`/api/journal-entries/${editingEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to update journal entry');
        return response.json();
      } else {
        const response = await fetch('/api/journal-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Failed to create journal entry');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      setShowModal(false);
      setEditingEntry(null);
      reset();
    },
  });

  // Post journal entry mutation
  const postJournalEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/journal-entries/${id}/post`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to post journal entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
  });

  // Delete journal entry mutation
  const deleteJournalEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/journal-entries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete journal entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
  });

  // Form handling
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    control,
    formState: { errors } 
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      lines: [
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines"
  });

  const watchedLines = watch('lines');

  // Calculate totals
  const totalDebits = watchedLines?.reduce((sum, line) => sum + (line.debitAmount || 0), 0) || 0;
  const totalCredits = watchedLines?.reduce((sum, line) => sum + (line.creditAmount || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Filter journal entries
  const filteredEntries = journalEntries.filter((entry: JournalEntry) => {
    if (!entry) return false;
    
    const safeSearchTerm = (searchTerm || '').toLowerCase();
    const matchesSearch = 
      (entry.journalNumber || '').toLowerCase().includes(safeSearchTerm) ||
      (entry.description || '').toLowerCase().includes(safeSearchTerm) ||
      (entry.reference && entry.reference.toLowerCase().includes(safeSearchTerm));
    const matchesStatus = !filterStatus || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleNew = () => {
    setEditingEntry(null);
    reset({
      transactionDate: new Date().toISOString().split('T')[0],
      lines: [
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    });
    setShowModal(true);
  };

  const onSubmit = (data: JournalEntryFormData) => {
    saveJournalEntryMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournalEntryMutation.mutate(id);
    }
  };

  const handlePost = (id: string) => {
    if (window.confirm('Are you sure you want to post this journal entry? This action cannot be undone.')) {
      postJournalEntryMutation.mutate(id);
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'warning', text: 'Draft' },
      posted: { bg: 'success', text: 'Posted' },
      reversed: { bg: 'danger', text: 'Reversed' }
    };
    const badge = badges[status as keyof typeof badges] || { bg: 'secondary', text: status };
    return (
      <span className={`badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25`}>
        {badge.text}
      </span>
    );
  };

  // DataTable columns
  const columns: Column[] = [
    {
      key: 'journalNumber',
      label: 'Journal #',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-monospace fw-bold text-primary">{value}</span>
      )
    },
    {
      key: 'transactionDate',
      label: 'Date',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="fw-semibold">{value}</div>
          {row.reference && (
            <small className="text-muted">Ref: {row.reference}</small>
          )}
        </div>
      )
    },
    {
      key: 'totalDebit',
      label: 'Total Debit',
      width: '120px',
      render: (value) => (
        <span className="font-monospace text-success">
          ${parseFloat(value).toFixed(2)}
        </span>
      )
    },
    {
      key: 'totalCredit',
      label: 'Total Credit',
      width: '120px',
      render: (value) => (
        <span className="font-monospace text-info">
          ${parseFloat(value).toFixed(2)}
        </span>
      )
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
          {row.status === 'draft' && (
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => handlePost(row.id)}
              data-testid={`button-post-entry-${row.id}`}
              title="Post Entry"
            >
              <FaCheck size={12} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => setEditingEntry(row)}
            data-testid={`button-view-entry-${row.id}`}
            title="View Details"
          >
            <FaEye size={12} />
          </button>
          {row.status === 'draft' && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(row.id)}
              data-testid={`button-delete-entry-${row.id}`}
              title="Delete Entry"
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>
      )
    }
  ];

  // Journal entry stats
  const entryStats = React.useMemo(() => {
    const stats = {
      total: journalEntries.length,
      draft: journalEntries.filter((e: JournalEntry) => e.status === 'draft').length,
      posted: journalEntries.filter((e: JournalEntry) => e.status === 'posted').length,
      totalValue: journalEntries.reduce((sum: number, e: JournalEntry) => sum + parseFloat(e.totalDebit), 0),
    };
    return stats;
  }, [journalEntries]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load journal entries. Please try again.
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
            <FaPen className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            Journal Entries
          </h2>
          <p className="text-muted mb-0">Create and manage manual journal entries for your accounting records</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="btn btn-success d-flex align-items-center gap-2 px-3"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
          data-testid="button-add-journal-entry"
        >
          <FaPlus size={14} />
          New Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-primary fw-bold">{entryStats.total}</div>
              <div className="small text-muted">Total Entries</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-warning fw-bold">{entryStats.draft}</div>
              <div className="small text-muted">Draft</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-success fw-bold">{entryStats.posted}</div>
              <div className="small text-muted">Posted</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-3">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-info fw-bold">${entryStats.totalValue.toFixed(2)}</div>
              <div className="small text-muted">Total Value</div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Filters */}
      <AnimatedCard>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-entries"
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
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {/* Journal Entries Table */}
      <AnimatedCard>
        <DataTable
          columns={columns}
          data={filteredEntries}
          loading={isLoading}
          emptyMessage="No journal entries found"
          className="table-hover"
        />
      </AnimatedCard>

      {/* Add/Edit Modal */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
        size="xl"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="journal-entry-form"
              className="btn btn-primary"
              disabled={saveJournalEntryMutation.isPending || !isBalanced}
              data-testid="button-save-journal-entry"
            >
              {saveJournalEntryMutation.isPending ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Saving...
                </>
              ) : (
                editingEntry ? 'Update Entry' : 'Save Entry'
              )}
            </button>
          </>
        }
      >
        <form id="journal-entry-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
                  {/* Entry Header */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Transaction Date *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.transactionDate ? 'is-invalid' : ''}`}
                        {...register('transactionDate')}
                        data-testid="input-transaction-date"
                      />
                      {errors.transactionDate && (
                        <div className="invalid-feedback">
                          {errors.transactionDate?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Reference</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('reference')}
                        placeholder="e.g., INV-001, PO-001"
                        data-testid="input-reference"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        {...register('description')}
                        placeholder="Entry description"
                        data-testid="input-description"
                      />
                      {errors.description && (
                        <div className="invalid-feedback">
                          {errors.description?.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entry Lines */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Journal Entry Lines</h6>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => append({ accountId: '', description: '', debitAmount: 0, creditAmount: 0 })}
                        data-testid="button-add-line"
                      >
                        <FaPlus size={12} className="me-1" />
                        Add Line
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '300px' }}>Account</th>
                            <th>Description</th>
                            <th style={{ width: '120px' }}>Debit</th>
                            <th style={{ width: '120px' }}>Credit</th>
                            <th style={{ width: '60px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.map((field, index) => (
                            <tr key={field.id}>
                              <td>
                                <select
                                  className={`form-select form-select-sm ${errors.lines?.[index]?.accountId ? 'is-invalid' : ''}`}
                                  {...register(`lines.${index}.accountId`)}
                                  data-testid={`select-account-${index}`}
                                >
                                  <option value="">Select account...</option>
                                  {activeAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                      {account.accountCode} - {account.accountName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  {...register(`lines.${index}.description`)}
                                  placeholder="Line description"
                                  data-testid={`input-line-description-${index}`}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-control form-control-sm text-end"
                                  {...register(`lines.${index}.debitAmount`)}
                                  placeholder="0.00"
                                  data-testid={`input-debit-${index}`}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-control form-control-sm text-end"
                                  {...register(`lines.${index}.creditAmount`)}
                                  placeholder="0.00"
                                  data-testid={`input-credit-${index}`}
                                />
                              </td>
                              <td className="text-center">
                                {fields.length > 2 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => remove(index)}
                                    data-testid={`button-remove-line-${index}`}
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={2} className="text-end fw-bold">Totals:</td>
                            <td className="text-end fw-bold text-success">${totalDebits.toFixed(2)}</td>
                            <td className="text-end fw-bold text-info">${totalCredits.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Balance Check */}
                    <div className={`alert ${isBalanced ? 'alert-success' : 'alert-danger'} mb-0`}>
                      <div className="d-flex align-items-center">
                        {isBalanced ? <FaCheck className="me-2" /> : <FaTimes className="me-2" />}
                        {isBalanced ? 'Entry is balanced' : `Entry is out of balance by $${Math.abs(totalDebits - totalCredits).toFixed(2)}`}
                      </div>
                    </div>

                    {errors.lines && (
                      <div className="text-danger mt-2">
                        {errors.lines.message}
                      </div>
                    )}
                  </div>
                </div>
        </form>
      </AnimatedModal>
    </div>
  );
};

export default JournalEntries;