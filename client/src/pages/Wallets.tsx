import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaWallet, FaSearch, FaFilter, FaExchangeAlt, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form Schemas
const walletSchema = z.object({
  entityType: z.enum(['customer', 'vendor']),
  entityId: z.string().min(1, "Entity is required"),
  walletType: z.enum(['credit', 'refund', 'store_credit', 'vendor_credit']),
  currentBalance: z.coerce.number().min(0).default(0),
  expiresAt: z.string().optional(),
});

const transactionSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  transactionType: z.enum(['credit', 'debit', 'transfer', 'adjustment']),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().optional(),
  referenceType: z.string().optional(),
});

type WalletFormData = z.infer<typeof walletSchema>;
type TransactionFormData = z.infer<typeof transactionSchema>;

interface Wallet {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  entityEmail?: string;
  walletType: string;
  currentBalance: string;
  totalEarned: string;
  totalUsed: string;
  currency: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  transactionType: string;
  amount: string;
  description: string;
  reference?: string;
  referenceType?: string;
  previousBalance: string;
  newBalance: string;
  performedBy: string;
  createdAt: string;
}

interface Entity {
  id: string;
  name: string;
  email?: string;
}

const Wallets = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch wallets
  const { data: wallets = [], isLoading, error } = useQuery<Wallet[]>({
    queryKey: ['/api/wallets'],
  });

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery<Entity[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch vendors for dropdown
  const { data: vendors = [] } = useQuery<Entity[]>({
    queryKey: ['/api/vendors'],
  });

  // Fetch wallet transactions
  const { data: transactions = [] } = useQuery<WalletTransaction[]>({
    queryKey: ['/api/wallet-transactions', selectedWallet?.id],
    enabled: !!selectedWallet?.id,
  });

  // Create/Update wallet mutation
  const saveWalletMutation = useMutation({
    mutationFn: async (data: WalletFormData) => {
      if (editingWallet) {
        const response = await fetch(`/api/wallets/${editingWallet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update wallet');
        return response.json();
      } else {
        const response = await fetch('/api/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create wallet');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      setShowWalletModal(false);
      setEditingWallet(null);
      resetWallet();
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/wallet-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-transactions'] });
      setShowTransactionModal(false);
      resetTransaction();
    },
  });

  // Delete wallet mutation
  const deleteWalletMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete wallet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    },
  });

  // Form handling
  const { 
    register: registerWallet, 
    handleSubmit: handleSubmitWallet, 
    reset: resetWallet, 
    setValue: setWalletValue,
    watch: watchWallet,
    formState: { errors: walletErrors } 
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      entityType: 'customer',
      walletType: 'credit',
      currentBalance: 0
    }
  });

  const { 
    register: registerTransaction, 
    handleSubmit: handleSubmitTransaction, 
    reset: resetTransaction, 
    setValue: setTransactionValue,
    formState: { errors: transactionErrors } 
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: 'credit'
    }
  });

  const watchedEntityType = watchWallet('entityType');

  // Get available entities based on type
  const availableEntities = watchedEntityType === 'customer' ? customers : vendors;

  // Calculate wallet statistics
  const walletStats = useMemo(() => {
    const stats = {
      totalWallets: wallets.length,
      activeWallets: wallets.filter((w: Wallet) => w.isActive).length,
      totalBalance: wallets.reduce((sum: number, w: Wallet) => sum + parseFloat(w.currentBalance), 0),
      customerWallets: wallets.filter((w: Wallet) => w.entityType === 'customer').length,
      vendorWallets: wallets.filter((w: Wallet) => w.entityType === 'vendor').length,
      expiringWallets: wallets.filter((w: Wallet) => {
        if (!w.expiresAt) return false;
        const expiryDate = new Date(w.expiresAt);
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return expiryDate <= thirtyDaysFromNow;
      }).length,
    };
    return stats;
  }, [wallets]);

  // Filter wallets
  const filteredWallets = wallets.filter((wallet: Wallet) => {
    const entityName = wallet.entityName || '';
    const entityEmail = wallet.entityEmail || '';
    const matchesSearch = 
      entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entityEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || wallet.walletType === filterType;
    const matchesEntity = !filterEntity || wallet.entityType === filterEntity;
    
    return matchesSearch && matchesType && matchesEntity;
  });

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setWalletValue('entityType', wallet.entityType as any);
    setWalletValue('entityId', wallet.entityId);
    setWalletValue('walletType', wallet.walletType as any);
    setWalletValue('currentBalance', parseFloat(wallet.currentBalance));
    setWalletValue('expiresAt', wallet.expiresAt ? wallet.expiresAt.split('T')[0] : '');
    setShowWalletModal(true);
  };

  const handleNewWallet = () => {
    setEditingWallet(null);
    resetWallet({
      entityType: 'customer',
      walletType: 'credit',
      currentBalance: 0
    });
    setShowWalletModal(true);
  };

  const handleNewTransaction = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setTransactionValue('walletId', wallet.id);
    setShowTransactionModal(true);
  };

  const handleViewTransactions = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setShowTransactionsModal(true);
  };

  const onSubmitWallet = (data: WalletFormData) => {
    saveWalletMutation.mutate(data);
  };

  const onSubmitTransaction = (data: TransactionFormData) => {
    createTransactionMutation.mutate(data);
  };

  const handleDeleteWallet = (id: string) => {
    if (window.confirm('Are you sure you want to delete this wallet?')) {
      deleteWalletMutation.mutate(id);
    }
  };

  // Wallet type badge
  const getWalletTypeBadge = (type: string) => {
    const badges = {
      credit: { bg: 'success', text: 'Credit' },
      refund: { bg: 'info', text: 'Refund' },
      store_credit: { bg: 'primary', text: 'Store Credit' },
      vendor_credit: { bg: 'warning', text: 'Vendor Credit' }
    };
    const badge = badges[type as keyof typeof badges] || { bg: 'secondary', text: type };
    return (
      <span className={`badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25`}>
        {badge.text}
      </span>
    );
  };

  // Transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    const badges = {
      credit: { bg: 'success', text: 'Credit' },
      debit: { bg: 'danger', text: 'Debit' },
      transfer: { bg: 'info', text: 'Transfer' },
      adjustment: { bg: 'warning', text: 'Adjustment' }
    };
    const badge = badges[type as keyof typeof badges] || { bg: 'secondary', text: type };
    return (
      <span className={`badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25`}>
        {badge.text}
      </span>
    );
  };

  // AG-Grid Column Definitions for wallets
  const walletColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Entity',
      field: 'entityName',
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-semibold">${params.value}</div>
          <small class="text-muted text-capitalize">${params.data.entityType}</small>
          ${params.data.entityEmail ? `<small class="text-muted d-block">${params.data.entityEmail}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'Type',
      field: 'walletType',
      sortable: true,
      filter: true,
      width: 130,
      cellRenderer: (params: any) => {
        const badges = {
          credit: { bg: 'primary', text: 'Credit' },
          refund: { bg: 'warning', text: 'Refund' },
          store_credit: { bg: 'success', text: 'Store Credit' },
          vendor_credit: { bg: 'info', text: 'Vendor Credit' }
        };
        const badge = badges[params.value as keyof typeof badges] || { bg: 'secondary', text: params.value };
        return `<span class="badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25">${badge.text}</span>`;
      }
    },
    {
      headerName: 'Balance',
      field: 'currentBalance',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace fw-bold text-success">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Earned',
      field: 'totalEarned',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="font-monospace text-info">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Used',
      field: 'totalUsed',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => 
        `<span class="font-monospace text-danger">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Expires',
      field: 'expiresAt',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        if (!params.value) return '<span class="text-muted">Never</span>';
        const isExpiringSoon = new Date(params.value) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const className = isExpiringSoon ? 'text-warning fw-bold' : '';
        return `<span class="${className}">${new Date(params.value).toLocaleDateString()}</span>`;
      }
    },
    {
      headerName: 'Status',
      field: 'isActive',
      sortable: true,
      filter: true,
      width: 80,
      cellRenderer: (params: any) => 
        `<span class="badge ${params.value ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">${params.value ? 'Active' : 'Inactive'}</span>`
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 180,
      cellRenderer: (params: any) => `
        <div class="d-flex gap-1">
          <button
            type="button"
            class="btn btn-outline-success btn-sm"
            onclick="window.handleNewTransaction('${params.data.id}')"
            data-testid="button-transaction-${params.data.id}"
            title="New Transaction"
          >
            <i class="fas fa-exchange-alt"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-info btn-sm"
            onclick="window.handleViewTransactions('${params.data.id}')"
            data-testid="button-history-${params.data.id}"
            title="View History"
          >
            <i class="fas fa-history"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            onclick="window.handleEditWallet('${params.data.id}')"
            data-testid="button-edit-${params.data.id}"
            title="Edit"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm"
            onclick="window.handleDeleteWallet('${params.data.id}')"
            data-testid="button-delete-${params.data.id}"
            title="Delete"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
    }
  ], []);

  // AG-Grid Column Definitions for transactions
  const transactionColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'createdAt',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Type',
      field: 'transactionType',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        const badges = {
          credit: { bg: 'success', text: 'Credit' },
          debit: { bg: 'danger', text: 'Debit' },
          transfer: { bg: 'info', text: 'Transfer' },
          adjustment: { bg: 'warning', text: 'Adjustment' }
        };
        const badge = badges[params.value as keyof typeof badges] || { bg: 'secondary', text: params.value };
        return `<span class="badge bg-${badge.bg} bg-opacity-10 text-${badge.bg} border border-${badge.bg} border-opacity-25">${badge.text}</span>`;
      }
    },
    {
      headerName: 'Amount',
      field: 'amount',
      sortable: true,
      filter: true,
      width: 100,
      cellRenderer: (params: any) => {
        const isDebit = params.data.transactionType === 'debit';
        const sign = isDebit ? '-' : '+';
        const className = isDebit ? 'text-danger' : 'text-success';
        return `<span class="font-monospace fw-bold ${className}">${sign}$${parseFloat(params.value).toFixed(2)}</span>`;
      }
    },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params: any) => `
        <div>
          <div>${params.value}</div>
          ${params.data.reference ? `<small class="text-muted">Ref: ${params.data.reference}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'New Balance',
      field: 'newBalance',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="font-monospace">$${parseFloat(params.value).toFixed(2)}</span>`
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleNewTransaction = (walletId: string) => {
      const wallet = wallets?.find(w => w.id === walletId);
      if (wallet) handleNewTransaction(wallet);
    };
    
    (window as any).handleViewTransactions = (walletId: string) => {
      const wallet = wallets?.find(w => w.id === walletId);
      if (wallet) handleViewTransactions(wallet);
    };
    
    (window as any).handleEditWallet = (walletId: string) => {
      const wallet = wallets?.find(w => w.id === walletId);
      if (wallet) handleEditWallet(wallet);
    };
    
    (window as any).handleDeleteWallet = (walletId: string) => {
      handleDeleteWallet(walletId);
    };
    
    return () => {
      delete (window as any).handleNewTransaction;
      delete (window as any).handleViewTransactions;
      delete (window as any).handleEditWallet;
      delete (window as any).handleDeleteWallet;
    };
  }, [wallets]);

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load wallets. Please try again.
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
            <FaWallet className="me-2" style={{ color: 'var(--shopify-green)' }} />
            Wallets & Credits
          </h2>
          <p className="text-muted mb-0">Manage customer and vendor credit wallets and transactions</p>
        </div>
        <button
          type="button"
          onClick={handleNewWallet}
          className="btn btn-primary d-flex align-items-center gap-2 px-3 btn-ripple hover-lift"
          data-testid="button-add-wallet"
          style={{ 
            background: `linear-gradient(135deg, ${designTokens.colors.shopify.green} 0%, ${designTokens.colors.shopify.greenLight} 100%)`,
            border: 'none'
          }}
        >
          <FaPlus size={14} />
          New Wallet
        </button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3">
                  <i className="fas fa-wallet fs-4 text-primary"></i>
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary">Total</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-primary fw-bold" data-testid="text-total-wallets">
                  {walletStats.totalWallets}
                </div>
                <div className="text-muted small">Total Wallets</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-success" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-success bg-opacity-10 rounded-3">
                  <i className="fas fa-check-circle fs-4 text-success"></i>
                </div>
                <div className="badge bg-success bg-opacity-10 text-success">Active</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-success fw-bold" data-testid="text-active-wallets">
                  {walletStats.activeWallets}
                </div>
                <div className="text-muted small">Active Wallets</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-info" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-info bg-opacity-10 rounded-3">
                  <i className="fas fa-dollar-sign fs-4 text-info"></i>
                </div>
                <div className="badge bg-info bg-opacity-10 text-info">Balance</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-info fw-bold" data-testid="text-total-balance">
                  ${walletStats.totalBalance.toFixed(2)}
                </div>
                <div className="text-muted small">Total Balance</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-warning" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-warning bg-opacity-10 rounded-3">
                  <i className="fas fa-users fs-4 text-warning"></i>
                </div>
                <div className="badge bg-warning bg-opacity-10 text-warning">Customers</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-warning fw-bold" data-testid="text-customer-wallets">
                  {walletStats.customerWallets}
                </div>
                <div className="text-muted small">Customer Wallets</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-secondary" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-secondary bg-opacity-10 rounded-3">
                  <i className="fas fa-building fs-4 text-secondary"></i>
                </div>
                <div className="badge bg-secondary bg-opacity-10 text-secondary">Vendors</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-secondary fw-bold" data-testid="text-vendor-wallets">
                  {walletStats.vendorWallets}
                </div>
                <div className="text-muted small">Vendor Wallets</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-danger" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                  <i className="fas fa-clock fs-4 text-danger"></i>
                </div>
                <div className="badge bg-danger bg-opacity-10 text-danger">Expiring</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-danger fw-bold" data-testid="text-expiring-wallets">
                  {walletStats.expiringWallets}
                </div>
                <div className="text-muted small">Expiring Soon</div>
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
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-wallets"
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
              <option value="credit">Credit</option>
              <option value="refund">Refund</option>
              <option value="store_credit">Store Credit</option>
              <option value="vendor_credit">Vendor Credit</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              data-testid="select-filter-entity"
            >
              <option value="">All Entities</option>
              <option value="customer">Customers</option>
              <option value="vendor">Vendors</option>
            </select>
          </div>
        </div>
      </AnimatedCard>

      {/* Wallets Table */}
      <AnimatedCard>
        <AGDataGrid
          rowData={filteredWallets}
          columnDefs={walletColumnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={20}
          height="500px"
          enableExport={true}
          exportFileName="wallets"
          showExportButtons={false}
          enableFiltering={true}
          enableSorting={true}
          enableResizing={true}
          sideBar={false}
        />
      </AnimatedCard>

      {/* Add/Edit Wallet Modal */}
      {showWalletModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingWallet ? 'Edit Wallet' : 'Create New Wallet'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowWalletModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitWallet(onSubmitWallet)}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Entity Type *</label>
                      <select
                        className={`form-select ${walletErrors.entityType ? 'is-invalid' : ''}`}
                        {...registerWallet('entityType')}
                        data-testid="select-entity-type"
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                      </select>
                      {walletErrors.entityType && (
                        <div className="invalid-feedback">
                          {walletErrors.entityType?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">{watchedEntityType === 'customer' ? 'Customer' : 'Vendor'} *</label>
                      <select
                        className={`form-select ${walletErrors.entityId ? 'is-invalid' : ''}`}
                        {...registerWallet('entityId')}
                        data-testid="select-entity"
                      >
                        <option value="">Select {watchedEntityType}...</option>
                        {availableEntities.map((entity) => (
                          <option key={entity.id} value={entity.id}>
                            {entity.name} {entity.email && `(${entity.email})`}
                          </option>
                        ))}
                      </select>
                      {walletErrors.entityId && (
                        <div className="invalid-feedback">
                          {walletErrors.entityId?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Wallet Type *</label>
                      <select
                        className={`form-select ${walletErrors.walletType ? 'is-invalid' : ''}`}
                        {...registerWallet('walletType')}
                        data-testid="select-wallet-type"
                      >
                        <option value="credit">Credit</option>
                        <option value="refund">Refund</option>
                        <option value="store_credit">Store Credit</option>
                        <option value="vendor_credit">Vendor Credit</option>
                      </select>
                      {walletErrors.walletType && (
                        <div className="invalid-feedback">
                          {walletErrors.walletType?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Initial Balance</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${walletErrors.currentBalance ? 'is-invalid' : ''}`}
                        {...registerWallet('currentBalance')}
                        placeholder="0.00"
                        data-testid="input-balance"
                      />
                      {walletErrors.currentBalance && (
                        <div className="invalid-feedback">
                          {walletErrors.currentBalance?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        {...registerWallet('expiresAt')}
                        data-testid="input-expires-at"
                      />
                      <div className="form-text">Leave empty for no expiry</div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowWalletModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saveWalletMutation.isPending}
                    data-testid="button-save-wallet"
                  >
                    {saveWalletMutation.isPending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Saving...
                      </>
                    ) : (
                      editingWallet ? 'Update Wallet' : 'Create Wallet'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedWallet && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  New Transaction - {selectedWallet.entityName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTransactionModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitTransaction(onSubmitTransaction)}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Current Balance:</strong> ${parseFloat(selectedWallet.currentBalance).toFixed(2)}
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Transaction Type *</label>
                      <select
                        className={`form-select ${transactionErrors.transactionType ? 'is-invalid' : ''}`}
                        {...registerTransaction('transactionType')}
                        data-testid="select-transaction-type"
                      >
                        <option value="credit">Credit (Add Money)</option>
                        <option value="debit">Debit (Remove Money)</option>
                        <option value="adjustment">Adjustment</option>
                      </select>
                      {transactionErrors.transactionType && (
                        <div className="invalid-feedback">
                          {transactionErrors.transactionType?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className={`form-control ${transactionErrors.amount ? 'is-invalid' : ''}`}
                        {...registerTransaction('amount')}
                        placeholder="0.00"
                        data-testid="input-transaction-amount"
                      />
                      {transactionErrors.amount && (
                        <div className="invalid-feedback">
                          {transactionErrors.amount?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea
                        className={`form-control ${transactionErrors.description ? 'is-invalid' : ''}`}
                        rows={3}
                        {...registerTransaction('description')}
                        placeholder="Reason for this transaction..."
                        data-testid="textarea-description"
                      />
                      {transactionErrors.description && (
                        <div className="invalid-feedback">
                          {transactionErrors.description?.message}
                        </div>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">Reference</label>
                      <input
                        type="text"
                        className="form-control"
                        {...registerTransaction('reference')}
                        placeholder="e.g., ORDER-001, REFUND-123"
                        data-testid="input-reference"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowTransactionModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createTransactionMutation.isPending}
                    data-testid="button-save-transaction"
                  >
                    {createTransactionMutation.isPending ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Processing...
                      </>
                    ) : (
                      'Create Transaction'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionsModal && selectedWallet && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Transaction History - {selectedWallet.entityName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowTransactionsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <div className="row">
                    <div className="col-md-3">
                      <strong>Current Balance:</strong><br />
                      ${parseFloat(selectedWallet.currentBalance).toFixed(2)}
                    </div>
                    <div className="col-md-3">
                      <strong>Total Earned:</strong><br />
                      ${parseFloat(selectedWallet.totalEarned).toFixed(2)}
                    </div>
                    <div className="col-md-3">
                      <strong>Total Used:</strong><br />
                      ${parseFloat(selectedWallet.totalUsed).toFixed(2)}
                    </div>
                    <div className="col-md-3">
                      <strong>Wallet Type:</strong><br />
                      {getWalletTypeBadge(selectedWallet.walletType)}
                    </div>
                  </div>
                </div>
                <AGDataGrid
                  rowData={transactions}
                  columnDefs={transactionColumnDefs}
                  loading={false}
                  pagination={true}
                  paginationPageSize={10}
                  height="400px"
                  enableExport={false}
                  showExportButtons={false}
                  enableFiltering={true}
                  enableSorting={true}
                  enableResizing={true}
                  sideBar={false}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTransactionsModal(false)}
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

export default Wallets;