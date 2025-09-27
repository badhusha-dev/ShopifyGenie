import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Using Bootstrap classes instead of react-bootstrap
import { FaPlus, FaEdit, FaTrash, FaEye, FaBalanceScale, FaSearch, FaFilter } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';
import { apiRequest } from '../lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Schema
const accountSchema = z.object({
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  accountSubtype: z.string().optional(),
  parentAccountId: z.string().optional(),
  description: z.string().optional(),
  normalBalance: z.enum(['debit', 'credit']),
  isActive: z.boolean().default(true)
});

type AccountFormData = z.infer<typeof accountSchema>;

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  accountSubtype?: string;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  normalBalance: string;
  createdAt: string;
  updatedAt: string;
}

const ChartOfAccounts = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts = [], isLoading, error } = useQuery<Account[]>({
    queryKey: ['/accounts'],
  });

  // Create/Update account mutation
  const saveAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      if (editingAccount) {
        const response = await fetch(`/api/accounts/${editingAccount.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update account');
        return response.json();
      } else {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create account');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/accounts'] });
      setShowModal(false);
      setEditingAccount(null);
      reset();
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete account');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/accounts'] });
    },
  });

  // Form handling
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      isActive: true,
      normalBalance: 'debit'
    }
  });

  const watchedAccountType = watch('accountType');

  // Auto-set normal balance based on account type
  React.useEffect(() => {
    if (watchedAccountType) {
      const normalBalance = ['asset', 'expense'].includes(watchedAccountType) ? 'debit' : 'credit';
      setValue('normalBalance', normalBalance);
    }
  }, [watchedAccountType, setValue]);

  // Filter accounts
  const filteredAccounts = accounts.filter((account: Account) => {
    const accountName = account.accountName || '';
    const accountCode = account.accountCode || '';
    const matchesSearch = accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accountCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || account.accountType === filterType;
    const matchesActive = showInactive || account.isActive;
    return matchesSearch && matchesType && matchesActive;
  });

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setValue('accountCode', account.accountCode);
    setValue('accountName', account.accountName);
    setValue('accountType', account.accountType as any);
    setValue('accountSubtype', account.accountSubtype || '');
    setValue('parentAccountId', account.parentAccountId || '');
    setValue('description', account.description || '');
    setValue('normalBalance', account.normalBalance as any);
    setValue('isActive', account.isActive);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingAccount(null);
    reset({
      isActive: true,
      normalBalance: 'debit'
    });
    setShowModal(true);
  };

  const onSubmit = (data: AccountFormData) => {
    saveAccountMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccountMutation.mutate(id);
    }
  };

  // Account type colors and badges
  const getAccountTypeBadge = (type: string) => {
    const badges = {
      asset: { bg: 'success', text: 'Asset' },
      liability: { bg: 'warning', text: 'Liability' },
      equity: { bg: 'info', text: 'Equity' },
      revenue: { bg: 'primary', text: 'Revenue' },
      expense: { bg: 'danger', text: 'Expense' }
    };
    const badge = badges[type as keyof typeof badges] || { bg: 'secondary', text: type };
    return (
      <span className={`badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25`}>
        {badge.text}
      </span>
    );
  };

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Code',
      field: 'accountCode',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-primary">${params.value}</span>`
    },
    {
      headerName: 'Account Name',
      field: 'accountName',
      sortable: true,
      filter: true,
      width: 250,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-semibold">${params.value}</div>
          ${params.data.description ? `<small class="text-muted">${params.data.description}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'Type',
      field: 'accountType',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params: any) => {
        const badges = {
          asset: { bg: 'success', text: 'Asset' },
          liability: { bg: 'warning', text: 'Liability' },
          equity: { bg: 'info', text: 'Equity' },
          revenue: { bg: 'primary', text: 'Revenue' },
          expense: { bg: 'danger', text: 'Expense' }
        };
        const badge = badges[params.value as keyof typeof badges] || { bg: 'secondary', text: params.value };
        return `<span class="badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25">${badge.text}</span>`;
      }
    },
    {
      headerName: 'Normal Balance',
      field: 'normalBalance',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="badge ${params.value === 'debit' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'}">${params.value.charAt(0).toUpperCase() + params.value.slice(1)}</span>`
    },
    {
      headerName: 'Status',
      field: 'isActive',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="badge ${params.value ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">${params.value ? 'Active' : 'Inactive'}</span>`
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params: any) => `
        <div class="d-flex gap-1">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            onclick="window.handleEditAccount('${params.data.id}')"
            data-testid="button-edit-account-${params.data.id}"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            onclick="window.handleDeleteAccount('${params.data.id}')"
            ${!params.data.isActive ? 'disabled' : ''}
            data-testid="button-delete-account-${params.data.id}"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleEditAccount = (id: string) => {
      const account = filteredAccounts.find(a => a.id === id);
      if (account) handleEdit(account);
    };
    
    (window as any).handleDeleteAccount = (id: string) => {
      handleDelete(id);
    };
    
    return () => {
      delete (window as any).handleEditAccount;
      delete (window as any).handleDeleteAccount;
    };
  }, [filteredAccounts]);

  // Account type counts for stats
  const accountStats = React.useMemo(() => {
    const stats = {
      total: accounts.length,
      active: accounts.filter((a: Account) => a.isActive).length,
      asset: accounts.filter((a: Account) => a.accountType === 'asset').length,
      liability: accounts.filter((a: Account) => a.accountType === 'liability').length,
      equity: accounts.filter((a: Account) => a.accountType === 'equity').length,
      revenue: accounts.filter((a: Account) => a.accountType === 'revenue').length,
      expense: accounts.filter((a: Account) => a.accountType === 'expense').length,
    };
    return stats;
  }, [accounts]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load chart of accounts. Please try again.
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
            <FaBalanceScale className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            Chart of Accounts
          </h2>
          <p className="text-muted mb-0">Manage your accounting structure and account classifications</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="btn btn-success d-flex align-items-center gap-2 px-3"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
          data-testid="button-add-account"
        >
          <FaPlus size={14} />
          Add Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-primary fw-bold">{accountStats.total}</div>
              <div className="small text-muted">Total Accounts</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-success fw-bold">{accountStats.active}</div>
              <div className="small text-muted">Active</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-info fw-bold">{accountStats.asset}</div>
              <div className="small text-muted">Assets</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-warning fw-bold">{accountStats.liability}</div>
              <div className="small text-muted">Liabilities</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-primary fw-bold">{accountStats.revenue}</div>
              <div className="small text-muted">Revenue</div>
            </div>
          </AnimatedCard>
        </div>
        <div className="col-md-2">
          <AnimatedCard>
            <div className="text-center">
              <div className="h4 mb-1 text-danger fw-bold">{accountStats.expense}</div>
              <div className="small text-muted">Expenses</div>
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
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-accounts"
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              data-testid="select-filter-type"
            >
              <option value="">All Types</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                data-testid="checkbox-show-inactive"
              />
              <label className="form-check-label" htmlFor="showInactive">
                Show Inactive
              </label>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Accounts Table */}
      <AnimatedCard>
        <AGDataGrid
          rowData={filteredAccounts}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={25}
          height="600px"
          enableExport={true}
          exportFileName="chart-of-accounts"
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
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
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
                <div className="mb-3">
                  <label className="form-label">Account Code *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.accountCode ? 'is-invalid' : ''}`}
                    {...register('accountCode')}
                    placeholder="e.g., 1000"
                    data-testid="input-account-code"
                  />
                  {errors.accountCode && (
                    <div className="invalid-feedback">
                      {errors.accountCode?.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Account Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.accountName ? 'is-invalid' : ''}`}
                    {...register('accountName')}
                    placeholder="e.g., Cash in Bank"
                    data-testid="input-account-name"
                  />
                  {errors.accountName && (
                    <div className="invalid-feedback">
                      {errors.accountName?.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Account Type *</label>
                  <select
                    className={`form-select ${errors.accountType ? 'is-invalid' : ''}`}
                    {...register('accountType')}
                    data-testid="select-account-type"
                  >
                    <option value="">Select type...</option>
                    <option value="asset">Asset</option>
                    <option value="liability">Liability</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expense</option>
                  </select>
                  {errors.accountType && (
                    <div className="invalid-feedback">
                      {errors.accountType?.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Account Subtype</label>
                  <input
                    type="text"
                    className="form-control"
                    {...register('accountSubtype')}
                    placeholder="e.g., Current Asset"
                    data-testid="input-account-subtype"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Normal Balance *</label>
                  <select
                    className={`form-select ${errors.normalBalance ? 'is-invalid' : ''}`}
                    {...register('normalBalance')}
                    data-testid="select-normal-balance"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                  {errors.normalBalance && (
                    <div className="invalid-feedback">
                      {errors.normalBalance?.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <div className="mt-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        {...register('isActive')}
                        data-testid="switch-is-active"
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    {...register('description')}
                    placeholder="Optional description of this account..."
                    data-testid="textarea-description"
                  />
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
                    className="btn btn-primary"
                    disabled={saveAccountMutation.isPending}
                    data-testid="button-save-account"
                  >
                    {saveAccountMutation.isPending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      editingAccount ? 'Update Account' : 'Create Account'
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

export default ChartOfAccounts;