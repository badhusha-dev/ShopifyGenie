import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaChartBar, FaCalendarAlt, FaDownload, FaPrint, FaSearch, FaFilter, FaFileAlt, FaBalanceScale, FaTint } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';

interface FinancialReportData {
  profitAndLoss: {
    revenue: Array<{ accountName: string; amount: number; }>;
    expenses: Array<{ accountName: string; amount: number; }>;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
  balanceSheet: {
    assets: {
      currentAssets: Array<{ accountName: string; amount: number; }>;
      fixedAssets: Array<{ accountName: string; amount: number; }>;
      totalCurrentAssets: number;
      totalFixedAssets: number;
      totalAssets: number;
    };
    liabilities: {
      currentLiabilities: Array<{ accountName: string; amount: number; }>;
      longTermLiabilities: Array<{ accountName: string; amount: number; }>;
      totalCurrentLiabilities: number;
      totalLongTermLiabilities: number;
      totalLiabilities: number;
    };
    equity: {
      equityAccounts: Array<{ accountName: string; amount: number; }>;
      retainedEarnings: number;
      totalEquity: number;
    };
  };
  cashFlow: {
    operatingActivities: Array<{ description: string; amount: number; }>;
    investingActivities: Array<{ description: string; amount: number; }>;
    financingActivities: Array<{ description: string; amount: number; }>;
    netOperatingCash: number;
    netInvestingCash: number;
    netFinancingCash: number;
    netCashFlow: number;
    beginningCash: number;
    endingCash: number;
  };
}

const FinancialReports = () => {
  const [selectedReport, setSelectedReport] = useState<'profit-loss' | 'balance-sheet' | 'cash-flow'>('profit-loss');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // Fetch financial report data
  const { data: reportData, isLoading, error } = useQuery<FinancialReportData>({
    queryKey: ['/api/financial-reports', selectedReport, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: selectedReport,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      const response = await fetch(`/api/financial-reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch financial reports');
      return response.json();
    }
  });

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    const params = new URLSearchParams({
      type: selectedReport,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      format
    });
    window.open(`/api/financial-reports/export?${params}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return isNegative ? `(${formattedAmount})` : formattedAmount;
  };

  const getAmountClass = (amount: number) => {
    return amount < 0 ? 'text-danger' : amount > 0 ? 'text-success' : 'text-muted';
  };

  // Profit & Loss Report Component
  const ProfitLossReport = () => {
    if (!reportData?.profitAndLoss) return null;
    
    const { revenue, expenses, totalRevenue, totalExpenses, netIncome } = reportData.profitAndLoss;
    
    return (
      <div className="row">
        <div className="col-12">
          <AnimatedCard>
            <div className="card-header bg-light">
              <h5 className="mb-0">Profit & Loss Statement</h5>
              <small className="text-muted">
                {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </small>
            </div>
            <div className="card-body">
              {/* Revenue Section */}
              <div className="mb-4">
                <h6 className="text-success fw-bold border-bottom pb-2">REVENUE</h6>
                {revenue.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace text-success">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Revenue</span>
                  <span className="font-monospace text-success">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="mb-4">
                <h6 className="text-danger fw-bold border-bottom pb-2">EXPENSES</h6>
                {expenses.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace text-danger">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Expenses</span>
                  <span className="font-monospace text-danger">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>

              {/* Net Income */}
              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between fw-bold h5">
                  <span>Net Income</span>
                  <span className={`font-monospace ${getAmountClass(netIncome)}`}>
                    {formatCurrency(netIncome)}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  };

  // Balance Sheet Report Component
  const BalanceSheetReport = () => {
    if (!reportData?.balanceSheet) return null;
    
    const { assets, liabilities, equity } = reportData.balanceSheet;
    
    return (
      <div className="row">
        <div className="col-lg-6">
          <AnimatedCard>
            <div className="card-header bg-light">
              <h5 className="mb-0">Assets</h5>
            </div>
            <div className="card-body">
              {/* Current Assets */}
              <div className="mb-4">
                <h6 className="text-primary fw-bold border-bottom pb-2">CURRENT ASSETS</h6>
                {assets.currentAssets.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Current Assets</span>
                  <span className="font-monospace">{formatCurrency(assets.totalCurrentAssets)}</span>
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="mb-4">
                <h6 className="text-primary fw-bold border-bottom pb-2">FIXED ASSETS</h6>
                {assets.fixedAssets.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Fixed Assets</span>
                  <span className="font-monospace">{formatCurrency(assets.totalFixedAssets)}</span>
                </div>
              </div>

              {/* Total Assets */}
              <div className="bg-primary bg-opacity-10 p-3 rounded">
                <div className="d-flex justify-content-between fw-bold h6">
                  <span>TOTAL ASSETS</span>
                  <span className="font-monospace">{formatCurrency(assets.totalAssets)}</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="col-lg-6">
          <AnimatedCard>
            <div className="card-header bg-light">
              <h5 className="mb-0">Liabilities & Equity</h5>
            </div>
            <div className="card-body">
              {/* Current Liabilities */}
              <div className="mb-4">
                <h6 className="text-warning fw-bold border-bottom pb-2">CURRENT LIABILITIES</h6>
                {liabilities.currentLiabilities.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Current Liabilities</span>
                  <span className="font-monospace">{formatCurrency(liabilities.totalCurrentLiabilities)}</span>
                </div>
              </div>

              {/* Long-term Liabilities */}
              <div className="mb-4">
                <h6 className="text-warning fw-bold border-bottom pb-2">LONG-TERM LIABILITIES</h6>
                {liabilities.longTermLiabilities.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Long-term Liabilities</span>
                  <span className="font-monospace">{formatCurrency(liabilities.totalLongTermLiabilities)}</span>
                </div>
              </div>

              {/* Equity */}
              <div className="mb-4">
                <h6 className="text-info fw-bold border-bottom pb-2">EQUITY</h6>
                {equity.equityAccounts.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.accountName}</span>
                    <span className="font-monospace">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between py-1">
                  <span>Retained Earnings</span>
                  <span className="font-monospace">{formatCurrency(equity.retainedEarnings)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Total Equity</span>
                  <span className="font-monospace">{formatCurrency(equity.totalEquity)}</span>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="bg-primary bg-opacity-10 p-3 rounded">
                <div className="d-flex justify-content-between fw-bold h6">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span className="font-monospace">
                    {formatCurrency(liabilities.totalLiabilities + equity.totalEquity)}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  };

  // Cash Flow Report Component
  const CashFlowReport = () => {
    if (!reportData?.cashFlow) return null;
    
    const { 
      operatingActivities, 
      investingActivities, 
      financingActivities,
      netOperatingCash,
      netInvestingCash,
      netFinancingCash,
      netCashFlow,
      beginningCash,
      endingCash
    } = reportData.cashFlow;
    
    return (
      <div className="row">
        <div className="col-12">
          <AnimatedCard>
            <div className="card-header bg-light">
              <h5 className="mb-0">Cash Flow Statement</h5>
              <small className="text-muted">
                {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </small>
            </div>
            <div className="card-body">
              {/* Operating Activities */}
              <div className="mb-4">
                <h6 className="text-primary fw-bold border-bottom pb-2">CASH FLOWS FROM OPERATING ACTIVITIES</h6>
                {operatingActivities.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.description}</span>
                    <span className={`font-monospace ${getAmountClass(item.amount)}`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Net Cash from Operating Activities</span>
                  <span className={`font-monospace ${getAmountClass(netOperatingCash)}`}>
                    {formatCurrency(netOperatingCash)}
                  </span>
                </div>
              </div>

              {/* Investing Activities */}
              <div className="mb-4">
                <h6 className="text-info fw-bold border-bottom pb-2">CASH FLOWS FROM INVESTING ACTIVITIES</h6>
                {investingActivities.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.description}</span>
                    <span className={`font-monospace ${getAmountClass(item.amount)}`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Net Cash from Investing Activities</span>
                  <span className={`font-monospace ${getAmountClass(netInvestingCash)}`}>
                    {formatCurrency(netInvestingCash)}
                  </span>
                </div>
              </div>

              {/* Financing Activities */}
              <div className="mb-4">
                <h6 className="text-warning fw-bold border-bottom pb-2">CASH FLOWS FROM FINANCING ACTIVITIES</h6>
                {financingActivities.map((item, index) => (
                  <div key={index} className="d-flex justify-content-between py-1">
                    <span>{item.description}</span>
                    <span className={`font-monospace ${getAmountClass(item.amount)}`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold border-top pt-2">
                  <span>Net Cash from Financing Activities</span>
                  <span className={`font-monospace ${getAmountClass(netFinancingCash)}`}>
                    {formatCurrency(netFinancingCash)}
                  </span>
                </div>
              </div>

              {/* Net Change in Cash */}
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between fw-bold">
                  <span>Net Change in Cash</span>
                  <span className={`font-monospace ${getAmountClass(netCashFlow)}`}>
                    {formatCurrency(netCashFlow)}
                  </span>
                </div>
              </div>

              {/* Cash Beginning & Ending */}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between py-1">
                  <span>Cash at Beginning of Period</span>
                  <span className="font-monospace">{formatCurrency(beginningCash)}</span>
                </div>
                <div className="d-flex justify-content-between py-1">
                  <span>Net Change in Cash</span>
                  <span className={`font-monospace ${getAmountClass(netCashFlow)}`}>
                    {formatCurrency(netCashFlow)}
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold border-top pt-2 h6">
                  <span>Cash at End of Period</span>
                  <span className="font-monospace">{formatCurrency(endingCash)}</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          Failed to load financial reports. Please try again.
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
            <FaChartBar className="me-2" style={{ color: designTokens.colors.shopify.green }} />
            Financial Reports
          </h2>
          <p className="text-muted mb-0">Generate and view comprehensive financial statements</p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="btn btn-outline-primary btn-sm"
            disabled={isLoading}
            data-testid="button-export-pdf"
          >
            <FaDownload className="me-1" size={12} />
            PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="btn btn-outline-success btn-sm"
            disabled={isLoading}
            data-testid="button-export-excel"
          >
            <FaDownload className="me-1" size={12} />
            Excel
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-outline-secondary btn-sm"
            data-testid="button-print"
          >
            <FaPrint className="me-1" size={12} />
            Print
          </button>
        </div>
      </div>

      {/* Report Selection & Date Range */}
      <AnimatedCard>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">Report Type</label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="profit-loss"
                checked={selectedReport === 'profit-loss'}
                onChange={() => setSelectedReport('profit-loss')}
              />
              <label className="btn btn-outline-primary" htmlFor="profit-loss">
                <FaFileAlt className="me-1" size={12} />
                P&L
              </label>

              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="balance-sheet"
                checked={selectedReport === 'balance-sheet'}
                onChange={() => setSelectedReport('balance-sheet')}
              />
              <label className="btn btn-outline-primary" htmlFor="balance-sheet">
                <FaBalanceScale className="me-1" size={12} />
                Balance Sheet
              </label>

              <input
                type="radio"
                className="btn-check"
                name="reportType"
                id="cash-flow"
                checked={selectedReport === 'cash-flow'}
                onChange={() => setSelectedReport('cash-flow')}
              />
              <label className="btn btn-outline-primary" htmlFor="cash-flow">
                <FaTint className="me-1" size={12} />
                Cash Flow
              </label>
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              data-testid="input-start-date"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              data-testid="input-end-date"
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={() => {
                // Force refetch with new parameters
                window.location.reload();
              }}
              disabled={isLoading}
              data-testid="button-generate-report"
            >
              {isLoading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>
      </AnimatedCard>

      {/* Report Content */}
      {isLoading ? (
        <AnimatedCard>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3">Generating financial report...</div>
          </div>
        </AnimatedCard>
      ) : (
        <div>
          {selectedReport === 'profit-loss' && <ProfitLossReport />}
          {selectedReport === 'balance-sheet' && <BalanceSheetReport />}
          {selectedReport === 'cash-flow' && <CashFlowReport />}
        </div>
      )}

      {/* Report Summary Cards */}
      {reportData && (
        <div className="row g-3 mt-4">
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h5 mb-1 text-success fw-bold">
                  {selectedReport === 'profit-loss' && reportData.profitAndLoss && 
                    formatCurrency(reportData.profitAndLoss.totalRevenue)}
                  {selectedReport === 'balance-sheet' && reportData.balanceSheet && 
                    formatCurrency(reportData.balanceSheet.assets.totalAssets)}
                  {selectedReport === 'cash-flow' && reportData.cashFlow && 
                    formatCurrency(reportData.cashFlow.endingCash)}
                </div>
                <div className="small text-muted">
                  {selectedReport === 'profit-loss' && 'Total Revenue'}
                  {selectedReport === 'balance-sheet' && 'Total Assets'}
                  {selectedReport === 'cash-flow' && 'Ending Cash'}
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h5 mb-1 text-danger fw-bold">
                  {selectedReport === 'profit-loss' && reportData.profitAndLoss && 
                    formatCurrency(reportData.profitAndLoss.totalExpenses)}
                  {selectedReport === 'balance-sheet' && reportData.balanceSheet && 
                    formatCurrency(reportData.balanceSheet.liabilities.totalLiabilities)}
                  {selectedReport === 'cash-flow' && reportData.cashFlow && 
                    formatCurrency(reportData.cashFlow.netOperatingCash)}
                </div>
                <div className="small text-muted">
                  {selectedReport === 'profit-loss' && 'Total Expenses'}
                  {selectedReport === 'balance-sheet' && 'Total Liabilities'}
                  {selectedReport === 'cash-flow' && 'Operating Cash Flow'}
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className={`h5 mb-1 fw-bold ${
                  selectedReport === 'profit-loss' && reportData.profitAndLoss
                    ? getAmountClass(reportData.profitAndLoss.netIncome)
                    : selectedReport === 'balance-sheet' && reportData.balanceSheet
                    ? 'text-info'
                    : selectedReport === 'cash-flow' && reportData.cashFlow
                    ? getAmountClass(reportData.cashFlow.netCashFlow)
                    : 'text-muted'
                }`}>
                  {selectedReport === 'profit-loss' && reportData.profitAndLoss && 
                    formatCurrency(reportData.profitAndLoss.netIncome)}
                  {selectedReport === 'balance-sheet' && reportData.balanceSheet && 
                    formatCurrency(reportData.balanceSheet.equity.totalEquity)}
                  {selectedReport === 'cash-flow' && reportData.cashFlow && 
                    formatCurrency(reportData.cashFlow.netCashFlow)}
                </div>
                <div className="small text-muted">
                  {selectedReport === 'profit-loss' && 'Net Income'}
                  {selectedReport === 'balance-sheet' && 'Total Equity'}
                  {selectedReport === 'cash-flow' && 'Net Cash Flow'}
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h5 mb-1 text-primary fw-bold">
                  {new Date(dateRange.startDate).toLocaleDateString()}
                </div>
                <div className="small text-muted">to</div>
                <div className="h5 mb-1 text-primary fw-bold">
                  {new Date(dateRange.endDate).toLocaleDateString()}
                </div>
                <div className="small text-muted">Report Period</div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;