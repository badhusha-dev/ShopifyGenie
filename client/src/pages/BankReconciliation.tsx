import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaUpload, FaCheck, FaTimes, FaSearch, FaFileImport, FaBalanceScale } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';
import { designTokens } from '../design/tokens';
import { apiRequest } from '../lib/queryClient';

interface BankStatement {
  id: string;
  statementDate: string;
  description: string;
  amount: string;
  balance: string;
  reference: string;
  isReconciled: boolean;
  reconciledWith?: string;
}

interface GLEntry {
  id: string;
  transactionDate: string;
  description: string;
  debitAmount: string;
  creditAmount: string;
  reference: string;
}

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

const BankReconciliation = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reconciliationMode, setReconciliationMode] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [matchingEntries, setMatchingEntries] = useState<GLEntry[]>([]);
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [reconciliationSummary, setReconciliationSummary] = useState<any>(null);
  
  const queryClient = useQueryClient();

  // Fetch bank accounts (cash/bank type accounts only)
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<Account[]>({
    queryKey: ['/accounts'],
    select: (data) => data.filter(account => 
      account.accountType === 'asset' && 
      (account.accountName.toLowerCase().includes('cash') || 
       account.accountName.toLowerCase().includes('bank'))
    )
  });

  // Fetch bank statements
  const { data: statements = [], isLoading: loadingStatements } = useQuery<BankStatement[]>({
    queryKey: ['/bank-statements', selectedAccount],
    enabled: !!selectedAccount,
  });

  // Fetch GL entries for matching
  const { data: glEntries = [], isLoading: loadingGL } = useQuery<GLEntry[]>({
    queryKey: ['/general-ledger', selectedAccount],
    enabled: !!selectedAccount,
  });

  // Upload bank statements
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bankAccountId', selectedAccount);
      
      const response = await fetch('/api/bank-statements/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/bank-statements', selectedAccount] });
      setUploadFile(null);
    },
  });

  // Match statement with GL entry
  const matchMutation = useMutation({
    mutationFn: async ({ statementId, glEntryId }: { statementId: string; glEntryId: string }) => {
      const response = await fetch(`/api/bank-reconciliations/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementId, glEntryId }),
      });
      if (!response.ok) throw new Error('Match failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/bank-statements', selectedAccount] });
      setSelectedStatement(null);
      setMatchingEntries([]);
    },
  });

  // Unmatch statement
  const unmatchMutation = useMutation({
    mutationFn: async (statementId: string) => {
      const response = await fetch(`/api/bank-reconciliations/unmatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementId }),
      });
      if (!response.ok) throw new Error('Unmatch failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/bank-statements', selectedAccount] });
    },
  });

  // Complete reconciliation
  const completeReconciliationMutation = useMutation({
    mutationFn: async (reconciliationId: string) => {
      const response = await fetch(`/api/bank-reconciliations/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reconciliationId }),
      });
      if (!response.ok) throw new Error('Complete reconciliation failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/bank-statements', selectedAccount] });
    },
  });

  const handleFileUpload = () => {
    if (uploadFile && selectedAccount) {
      uploadMutation.mutate(uploadFile);
    }
  };

  const findMatchingEntries = (statement: BankStatement) => {
    const amount = Math.abs(parseFloat(statement.amount));
    const matches = glEntries.filter(entry => {
      const entryAmount = parseFloat(entry.debitAmount) || parseFloat(entry.creditAmount);
      return Math.abs(entryAmount - amount) < 0.01;
    });
    setMatchingEntries(matches);
    setSelectedStatement(statement);
  };

  const handleMatch = (glEntryId: string) => {
    if (selectedStatement) {
      matchMutation.mutate({
        statementId: selectedStatement.id,
        glEntryId
      });
    }
  };

  const handleUnmatch = (statementId: string) => {
    unmatchMutation.mutate(statementId);
  };

  const handleCompleteReconciliation = () => {
    // In a real implementation, you would get the reconciliation ID
    const reconciliationId = 'recon-1';
    completeReconciliationMutation.mutate(reconciliationId);
  };

  // Filter statements based on showUnmatchedOnly
  const filteredStatements = useMemo(() => {
    if (showUnmatchedOnly) {
      return statements.filter(s => !s.isReconciled);
    }
    return statements;
  }, [statements, showUnmatchedOnly]);

  // Calculate reconciliation summary
  const summary = useMemo(() => {
    const total = statements.length;
    const reconciled = statements.filter(s => s.isReconciled).length;
    const unmatched = total - reconciled;
    const totalAmount = statements.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const reconciledAmount = statements
      .filter(s => s.isReconciled)
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const unmatchedAmount = totalAmount - reconciledAmount;

    return {
      total,
      reconciled,
      unmatched,
      totalAmount,
      reconciledAmount,
      unmatchedAmount,
      reconciliationRate: total > 0 ? (reconciled / total) * 100 : 0
    };
  }, [statements]);

  // AG-Grid Column Definitions for Bank Statements
  const statementColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'statementDate',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      filter: true,
      width: 250,
      cellRenderer: (params: any) => `
        <div>
          <div class="fw-bold">${params.value}</div>
          ${params.data.reference ? `<small class="text-muted">Ref: ${params.data.reference}</small>` : ''}
        </div>
      `
    },
    {
      headerName: 'Amount',
      field: 'amount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="${parseFloat(params.value) >= 0 ? 'text-success' : 'text-danger'}">$${parseFloat(params.value).toFixed(2)}</span>`
    },
    {
      headerName: 'Balance',
      field: 'balance',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => `$${parseFloat(params.value).toFixed(2)}`
    },
    {
      headerName: 'Status',
      field: 'isReconciled',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => 
        `<span class="badge ${params.value ? 'bg-success' : 'bg-warning'}">${params.value ? 'Reconciled' : 'Unmatched'}</span>`
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 150,
      cellRenderer: (params: any) => `
        <div class="d-flex gap-1">
          ${!params.data.isReconciled ? 
            `<button
              class="btn btn-outline-primary btn-sm"
              onclick="window.handleFindMatching('${params.data.id}')"
              data-testid="button-match-${params.data.id}"
            >
              <i class="fas fa-search me-1"></i>
              Match
            </button>` :
            `<div class="d-flex gap-1">
              <span class="text-success">
                <i class="fas fa-check me-1"></i>
                Matched
              </span>
              <button
                class="btn btn-outline-warning btn-sm"
                onclick="window.handleUnmatch('${params.data.id}')"
                data-testid="button-unmatch-${params.data.id}"
              >
                <i class="fas fa-undo me-1"></i>
                Unmatch
              </button>
            </div>`
          }
        </div>
      `
    }
  ], []);

  // AG-Grid Column Definitions for GL Entries
  const glColumnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Date',
      field: 'transactionDate',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Description',
      field: 'description',
      sortable: true,
      filter: true,
      width: 250
    },
    {
      headerName: 'Amount',
      field: 'amount',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const amount = parseFloat(params.data.debitAmount) || parseFloat(params.data.creditAmount);
        const isDebit = parseFloat(params.data.debitAmount) > 0;
        return `<span class="${isDebit ? 'text-success' : 'text-danger'}">$${amount.toFixed(2)}</span>`;
      }
    },
    {
      headerName: 'Reference',
      field: 'reference',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => params.value || '-'
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params: any) => `
        <button
          class="btn btn-success btn-sm"
          onclick="window.handleConfirmMatch('${params.data.id}')"
          data-testid="button-confirm-match-${params.data.id}"
        >
          <i class="fas fa-check me-1"></i>
          Match
        </button>
      `
    }
  ], []);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).handleFindMatching = (id: string) => {
      const statement = statements.find(s => s.id === id);
      if (statement) findMatchingEntries(statement);
    };
    
    (window as any).handleConfirmMatch = (id: string) => {
      handleMatch(id);
    };

    (window as any).handleUnmatch = (id: string) => {
      handleUnmatch(id);
    };
    
    return () => {
      delete (window as any).handleFindMatching;
      delete (window as any).handleConfirmMatch;
      delete (window as any).handleUnmatch;
    };
  }, [statements, matchMutation, unmatchMutation]);

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ color: designTokens.colors.shopify.green }}>
            <FaBalanceScale className="me-2" />
            Bank Reconciliation
          </h2>
          <p className="text-muted mt-1">Upload and match bank statements with general ledger entries</p>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Account Selection & Upload */}
        <div className="col-lg-4">
          <AnimatedCard>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Bank Account Setup</h5>
            </div>
            <div className="card-body">
              {/* Account Selection */}
              <div className="mb-4">
                <label className="form-label">Select Bank Account</label>
                <select
                  className="form-select"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  data-testid="select-bank-account"
                >
                  <option value="">Choose account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountCode} - {account.accountName}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              {selectedAccount && (
                <div className="mb-4">
                  <label className="form-label">Upload Bank Statement</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".csv,.ofx,.qfx"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      data-testid="input-statement-file"
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleFileUpload}
                      disabled={!uploadFile || uploadMutation.isPending}
                      data-testid="button-upload-file"
                    >
                      <FaUpload className="me-1" />
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  <small className="text-muted">
                    Supports CSV, OFX, and QFX formats
                  </small>
                </div>
              )}

              {/* Reconciliation Summary */}
              {selectedAccount && (
                <div className="border rounded p-3 bg-light">
                  <h6 className="mb-3">Reconciliation Status</h6>
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="text-success fw-bold fs-4">
                        {summary.reconciled}
                      </div>
                      <small className="text-muted">Reconciled</small>
                    </div>
                    <div className="col-6">
                      <div className="text-warning fw-bold fs-4">
                        {summary.unmatched}
                      </div>
                      <small className="text-muted">Unmatched</small>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${summary.reconciliationRate}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      {summary.reconciliationRate.toFixed(1)}% Complete
                    </small>
                  </div>
                  {summary.unmatched === 0 && summary.total > 0 && (
                    <div className="mt-3">
                      <button
                        className="btn btn-success btn-sm w-100"
                        onClick={handleCompleteReconciliation}
                        disabled={completeReconciliationMutation.isPending}
                      >
                        <FaCheck className="me-1" />
                        Complete Reconciliation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Upload Instructions */}
          <AnimatedCard className="mt-3">
            <div className="card-body">
              <h6 className="card-title">File Format Requirements</h6>
              <ul className="list-unstyled small">
                <li className="mb-1">
                  <span className="text-success">✓</span> CSV: Date, Description, Amount, Balance
                </li>
                <li className="mb-1">
                  <span className="text-success">✓</span> OFX: Standard banking format
                </li>
                <li className="mb-1">
                  <span className="text-success">✓</span> QFX: Quicken format
                </li>
                <li className="mb-1">
                  <span className="text-info">ℹ</span> File size limit: 10MB
                </li>
              </ul>
            </div>
          </AnimatedCard>
        </div>

        {/* Right Column - Statements & Matching */}
        <div className="col-lg-8">
          {selectedAccount ? (
            <>
              {/* Bank Statements */}
              <AnimatedCard>
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <FaFileImport className="me-2" />
                    Bank Statements
                  </h5>
                  <div className="d-flex gap-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showUnmatchedOnly"
                        checked={showUnmatchedOnly}
                        onChange={(e) => setShowUnmatchedOnly(e.target.checked)}
                      />
                      <label className="form-check-label text-white" htmlFor="showUnmatchedOnly">
                        Show Unmatched Only
                      </label>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {loadingStatements ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <AGDataGrid
                      rowData={filteredStatements}
                      columnDefs={statementColumnDefs}
                      loading={loadingStatements}
                      pagination={true}
                      paginationPageSize={20}
                      height="400px"
                      enableExport={true}
                      exportFileName="bank-statements"
                      showExportButtons={true}
                      enableFiltering={true}
                      enableSorting={true}
                      enableResizing={true}
                      sideBar={false}
                    />
                  )}
                </div>
              </AnimatedCard>

              {/* Matching Panel */}
              {selectedStatement && (
                <AnimatedCard className="mt-4">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">
                      <FaSearch className="me-2" />
                      Match Statement Entry
                    </h5>
                    <button
                      className="btn-close float-end"
                      onClick={() => {
                        setSelectedStatement(null);
                        setMatchingEntries([]);
                      }}
                      data-testid="button-close-matching"
                    ></button>
                  </div>
                  <div className="card-body">
                    {/* Selected Statement */}
                    <div className="alert alert-info">
                      <strong>Statement Entry:</strong> {selectedStatement.description} - 
                      <span className="ms-2">
                        ${parseFloat(selectedStatement.amount).toFixed(2)}
                      </span>
                      <span className="ms-2 text-muted">
                        ({new Date(selectedStatement.statementDate).toLocaleDateString()})
                      </span>
                    </div>

                    {/* Matching GL Entries */}
                    <h6>Potential Matches from General Ledger:</h6>
                    {matchingEntries.length > 0 ? (
                      <AGDataGrid
                        rowData={matchingEntries}
                        columnDefs={glColumnDefs}
                        loading={loadingGL}
                        pagination={true}
                        paginationPageSize={10}
                        height="300px"
                        enableExport={false}
                        showExportButtons={true}
                        enableFiltering={true}
                        enableSorting={true}
                        enableResizing={true}
                        sideBar={false}
                      />
                    ) : (
                      <div className="alert alert-warning">
                        No exact amount matches found. You may need to create a manual journal entry for this transaction.
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}
            </>
          ) : (
            <AnimatedCard>
              <div className="card-body text-center py-5">
                <FaBalanceScale className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h5 className="text-muted">Select a bank account to begin reconciliation</h5>
                <p className="text-muted">
                  Choose a cash or bank account from the dropdown to view statements and start matching.
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankReconciliation;