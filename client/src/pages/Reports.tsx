import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AnimatedKPICard from '@/components/ui/AnimatedKPICard';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface FinanceMetrics {
  totalRevenue: number;
  totalCOGS: number;
  grossMargin: number;
  refundRate: number;
  revenueGrowth: number;
  marginGrowth: number;
}

interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  customerName: string;
}

interface Wallet {
  id: string;
  customerName: string;
  balance: number;
  currency: string;
  lastActivity: string;
}

interface Payout {
  id: string;
  amount: number;
  vendor: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

const Reports: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const queryClient = useQueryClient();

  // Sample data - replace with actual API calls
  const financeMetrics: FinanceMetrics = {
    totalRevenue: 125000,
    totalCOGS: 75000,
    grossMargin: 40.0,
    refundRate: 2.5,
    revenueGrowth: 12.5,
    marginGrowth: -1.2
  };

  const revenueVsCOGSData = [
    { month: 'Jan', revenue: 20000, cogs: 12000 },
    { month: 'Feb', revenue: 22000, cogs: 13200 },
    { month: 'Mar', revenue: 25000, cogs: 15000 },
    { month: 'Apr', revenue: 28000, cogs: 16800 },
    { month: 'May', revenue: 30000, cogs: 18000 },
  ];

  const categoryMarginData = [
    { name: 'Electronics', value: 35, color: '#FF6B6B' },
    { name: 'Clothing', value: 45, color: '#2ECC71' },
    { name: 'Books', value: 60, color: '#3498DB' },
    { name: 'Home & Garden', value: 25, color: '#F39C12' },
  ];

  const { data: refunds = [] } = useQuery({
    queryKey: ['refunds'],
    queryFn: async () => {
      // Mock data for demo
      return [
        {
          id: '1',
          orderId: 'ORD-001',
          amount: 299.99,
          reason: 'Defective product',
          status: 'pending' as const,
          requestDate: '2024-01-15',
          customerName: 'John Doe'
        },
        {
          id: '2',
          orderId: 'ORD-002',
          amount: 149.50,
          reason: 'Wrong size',
          status: 'approved' as const,
          requestDate: '2024-01-14',
          customerName: 'Jane Smith'
        }
      ] as Refund[];
    }
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      // Mock data for demo
      return [
        {
          id: '1',
          customerName: 'Alice Johnson',
          balance: 156.75,
          currency: 'USD',
          lastActivity: '2024-01-15'
        },
        {
          id: '2',
          customerName: 'Bob Wilson',
          balance: 89.30,
          currency: 'USD',
          lastActivity: '2024-01-14'
        }
      ] as Wallet[];
    }
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts'],
    queryFn: async () => {
      // Mock data for demo
      return [
        {
          id: '1',
          amount: 2500.00,
          vendor: 'Tech Supplier Co.',
          dueDate: '2024-01-20',
          status: 'pending' as const,
          description: 'Monthly inventory payment'
        },
        {
          id: '2',
          amount: 1200.00,
          vendor: 'Logistics Partner',
          dueDate: '2024-01-18',
          status: 'paid' as const,
          description: 'Shipping services'
        }
      ] as Payout[];
    }
  });

  const adjustWalletMutation = useMutation({
    mutationFn: async ({ walletId, amount, reason }: { walletId: string; amount: number; reason: string }) => {
      const response = await fetch(`/api/wallets/${walletId}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      if (!response.ok) throw new Error('Failed to adjust wallet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setShowWalletModal(false);
      setSelectedWallet(null);
      setAdjustmentAmount('');
      setAdjustmentReason('');
    }
  });

  const handleWalletAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWallet) {
      adjustWalletMutation.mutate({
        walletId: selectedWallet.id,
        amount: parseFloat(adjustmentAmount),
        reason: adjustmentReason
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger',
      paid: 'bg-success',
      overdue: 'bg-danger'
    };
    return <span className={`badge ${badgeClasses[status as keyof typeof badgeClasses] || 'bg-secondary'}`}>
      {status}
    </span>;
  };

  const kpiData = [
    {
      title: 'Total Revenue',
      value: `$${financeMetrics.totalRevenue.toLocaleString()}`,
      change: `+${financeMetrics.revenueGrowth}%`,
      changeType: 'positive' as const,
      icon: 'fas fa-dollar-sign',
      gradient: 'shopify' as const
    },
    {
      title: 'Cost of Goods Sold',
      value: `$${financeMetrics.totalCOGS.toLocaleString()}`,
      change: '+8.2%',
      changeType: 'neutral' as const,
      icon: 'fas fa-shopping-cart',
      gradient: 'blue' as const
    },
    {
      title: 'Gross Margin',
      value: `${financeMetrics.grossMargin}%`,
      change: `${financeMetrics.marginGrowth > 0 ? '+' : ''}${financeMetrics.marginGrowth}%`,
      changeType: financeMetrics.marginGrowth > 0 ? 'positive' : 'negative' as const,
      icon: 'fas fa-chart-line',
      gradient: 'purple' as const
    },
    {
      title: 'Refund Rate',
      value: `${financeMetrics.refundRate}%`,
      change: '-0.3%',
      changeType: 'positive' as const,
      icon: 'fas fa-undo-alt',
      gradient: 'coral' as const
    }
  ];

  return (
    <div className="container-fluid animate-fade-in-up">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                <i className="fas fa-chart-line me-2 text-success"></i>
                Finance Dashboard
              </h1>
              <p className="text-muted mb-0">Monitor your business financial performance</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <i className="fas fa-download me-2"></i>
                Export Report
              </button>
              <button className="btn btn-shopify">
                <i className="fas fa-sync-alt me-2"></i>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="col-xl-3 col-lg-6">
            <AnimatedKPICard {...kpi} />
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs nav-fill" id="financeTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                <i className="fas fa-chart-bar me-2"></i>
                Financial Overview
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'refunds' ? 'active' : ''}`}
                onClick={() => setActiveTab('refunds')}
                type="button"
              >
                <i className="fas fa-undo me-2"></i>
                Refunds ({refunds.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'wallets' ? 'active' : ''}`}
                onClick={() => setActiveTab('wallets')}
                type="button"
              >
                <i className="fas fa-wallet me-2"></i>
                Wallets ({wallets.length})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'payouts' ? 'active' : ''}`}
                onClick={() => setActiveTab('payouts')}
                type="button"
              >
                <i className="fas fa-money-check me-2"></i>
                Payouts ({payouts.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Financial Overview Tab */}
        {activeTab === 'overview' && (
          <div className="row g-4">
            {/* Revenue vs COGS Chart */}
            <div className="col-lg-8">
              <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="fas fa-chart-area me-2 text-primary"></i>
                    Revenue vs Cost of Goods Sold
                  </h5>
                  <span className="badge bg-info-subtle text-info px-3 py-2">
                    Last 5 Months
                  </span>
                </div>
                <div style={{height: '350px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueVsCOGSData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--shopify-green)" 
                        strokeWidth={3}
                        name="Revenue"
                        dot={{ fill: 'var(--shopify-green)', strokeWidth: 2, r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cogs" 
                        stroke="var(--coral-accent)" 
                        strokeWidth={3}
                        name="COGS"
                        dot={{ fill: 'var(--coral-accent)', strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Category Margins Chart */}
            <div className="col-lg-4">
              <div className="modern-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="fas fa-chart-pie me-2 text-warning"></i>
                    Category Margins
                  </h5>
                </div>
                <div style={{height: '350px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryMarginData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryMarginData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="row">
            <div className="col-12">
              <div className="modern-card">
                <div className="table-responsive">
                  <table className="table modern-table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Reason</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.map((refund) => (
                        <tr key={refund.id}>
                          <td className="fw-semibold">{refund.orderId}</td>
                          <td>{refund.customerName}</td>
                          <td className="fw-bold text-success">${refund.amount.toFixed(2)}</td>
                          <td>{refund.reason}</td>
                          <td>{new Date(refund.requestDate).toLocaleDateString()}</td>
                          <td>{getStatusBadge(refund.status)}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              {refund.status === 'pending' && (
                                <>
                                  <button className="btn btn-outline-success">
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button className="btn btn-outline-danger">
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              )}
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
        )}

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <div className="row">
            <div className="col-12">
              <div className="modern-card">
                <div className="table-responsive">
                  <table className="table modern-table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Balance</th>
                        <th>Currency</th>
                        <th>Last Activity</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.map((wallet) => (
                        <tr key={wallet.id}>
                          <td className="fw-semibold">{wallet.customerName}</td>
                          <td className="fw-bold text-primary">${wallet.balance.toFixed(2)}</td>
                          <td>{wallet.currency}</td>
                          <td>{new Date(wallet.lastActivity).toLocaleDateString()}</td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedWallet(wallet);
                                setShowWalletModal(true);
                              }}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Adjust
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="row">
            <div className="col-12">
              <div className="modern-card">
                <div className="table-responsive">
                  <table className="table modern-table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id}>
                          <td className="fw-semibold">{payout.vendor}</td>
                          <td className="fw-bold text-warning">${payout.amount.toFixed(2)}</td>
                          <td>{new Date(payout.dueDate).toLocaleDateString()}</td>
                          <td>{payout.description}</td>
                          <td>{getStatusBadge(payout.status)}</td>
                          <td className="text-end">
                            {payout.status === 'pending' && (
                              <button className="btn btn-sm btn-shopify">
                                <i className="fas fa-credit-card me-1"></i>
                                Pay Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Adjustment Modal */}
      {showWalletModal && selectedWallet && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Adjust Wallet Balance - {selectedWallet.customerName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowWalletModal(false)}
                ></button>
              </div>
              <form onSubmit={handleWalletAdjustment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="currentBalance" className="form-label fw-semibold">Current Balance</label>
                    <input
                      type="text"
                      className="form-control"
                      id="currentBalance"
                      value={`$${selectedWallet.balance.toFixed(2)}`}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="adjustmentAmount" className="form-label fw-semibold">Adjustment Amount</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="adjustmentAmount"
                        step="0.01"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        placeholder="Enter positive or negative amount"
                        required
                      />
                    </div>
                    <div className="form-text">
                      Use positive values to add funds, negative values to deduct funds
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="adjustmentReason" className="form-label fw-semibold">Reason</label>
                    <textarea
                      className="form-control"
                      id="adjustmentReason"
                      rows={3}
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="Explain the reason for this adjustment"
                      required
                    />
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
                    className="btn btn-shopify"
                    disabled={adjustWalletMutation.isPending}
                  >
                    {adjustWalletMutation.isPending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      'Apply Adjustment'
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

export default Reports;