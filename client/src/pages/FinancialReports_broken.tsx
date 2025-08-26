import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaChartBar, FaCalendarAlt, FaDownload, FaPrint, FaSearch, FaFilter, FaFileAlt, FaBalanceScale, FaTint, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

// Chart colors for consistent theming
const CHART_COLORS = ['#00d4aa', '#0969da', '#8b5cf6', '#f59e0b', '#ef4444', '#84cc16', '#ec4899', '#06b6d4'];

const FinancialReports = () => {
  const [selectedReport, setSelectedReport] = useState<'profit-loss' | 'balance-sheet' | 'cash-flow'>('profit-loss');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

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

  // Mock data for demonstration since we don't have backend data
  const mockData = useMemo(() => {
    if (!reportData) {
      return {
        profitAndLoss: {
          revenue: [
            { accountName: 'Sales Revenue', amount: 150000 },
            { accountName: 'Service Revenue', amount: 75000 },
            { accountName: 'Other Income', amount: 12500 }
          ],
          expenses: [
            { accountName: 'Cost of Goods Sold', amount: 60000 },
            { accountName: 'Operating Expenses', amount: 45000 },
            { accountName: 'Marketing Expenses', amount: 18000 },
            { accountName: 'Administrative Expenses', amount: 25000 }
          ],
          totalRevenue: 237500,
          totalExpenses: 148000,
          netIncome: 89500
        },
        balanceSheet: {
          assets: {
            currentAssets: [
              { accountName: 'Cash & Equivalents', amount: 125000 },
              { accountName: 'Accounts Receivable', amount: 85000 },
              { accountName: 'Inventory', amount: 45000 }
            ],
            fixedAssets: [
              { accountName: 'Equipment', amount: 75000 },
              { accountName: 'Buildings', amount: 200000 }
            ],
            totalCurrentAssets: 255000,
            totalFixedAssets: 275000,
            totalAssets: 530000
          },
          liabilities: {
            currentLiabilities: [
              { accountName: 'Accounts Payable', amount: 35000 },
              { accountName: 'Short-term Debt', amount: 25000 }
            ],
            longTermLiabilities: [
              { accountName: 'Long-term Debt', amount: 150000 }
            ],
            totalCurrentLiabilities: 60000,
            totalLongTermLiabilities: 150000,
            totalLiabilities: 210000
          },
          equity: {
            equityAccounts: [
              { accountName: 'Owner\'s Equity', amount: 250000 },
              { accountName: 'Retained Earnings', amount: 70000 }
            ],
            retainedEarnings: 70000,
            totalEquity: 320000
          }
        },
        cashFlow: {
          operatingActivities: [
            { description: 'Net Income', amount: 89500 },
            { description: 'Depreciation', amount: 15000 },
            { description: 'Changes in Working Capital', amount: -8500 }
          ],
          investingActivities: [
            { description: 'Equipment Purchase', amount: -25000 },
            { description: 'Investment Sales', amount: 10000 }
          ],
          financingActivities: [
            { description: 'Loan Proceeds', amount: 50000 },
            { description: 'Dividends Paid', amount: -20000 }
          ],
          netOperatingCash: 96000,
          netInvestingCash: -15000,
          netFinancingCash: 30000,
          netCashFlow: 111000,
          beginningCash: 75000,
          endingCash: 186000
        }
      };
    }
    return reportData;
  }, [reportData]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (selectedReport === 'profit-loss' && mockData.profitAndLoss) {
      const { revenue, expenses } = mockData.profitAndLoss;
      return [
        ...revenue.map(item => ({ name: item.accountName, amount: item.amount, type: 'Revenue' })),
        ...expenses.map(item => ({ name: item.accountName, amount: item.amount, type: 'Expenses' }))
      ];
    }
    return [];
  }, [selectedReport, mockData]);

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
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark fw-bold gradient-text">
            <FaChartBar className="me-2" style={{ color: 'var(--shopify-green)' }} />
            Financial Reports
          </h2>
          <p className="text-muted mb-0">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => handleExport('excel')}
            data-testid="button-export-excel"
          >
            <FaDownload className="me-1" />
            Excel
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleExport('pdf')}
            data-testid="button-export-pdf"
          >
            <FaPrint className="me-1" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-success" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-success bg-opacity-10 rounded-3">
                  <FaArrowUp className="fs-4 text-success" />
                </div>
                <div className="badge bg-success bg-opacity-10 text-success">Revenue</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-success fw-bold" data-testid="text-total-revenue">
                  {formatCurrency(mockData.profitAndLoss?.totalRevenue || 0)}
                </div>
                <div className="text-muted small">Total Revenue</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-danger" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-danger bg-opacity-10 rounded-3">
                  <FaArrowDown className="fs-4 text-danger" />
                </div>
                <div className="badge bg-danger bg-opacity-10 text-danger">Expenses</div>
              </div>
              <div className="mb-2">
                <div className="h3 mb-1 text-danger fw-bold" data-testid="text-total-expenses">
                  {formatCurrency(mockData.profitAndLoss?.totalExpenses || 0)}
                </div>
                <div className="text-muted small">Total Expenses</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-primary" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3">
                  <FaEquals className="fs-4 text-primary" />
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary">Net Income</div>
              </div>
              <div className="mb-2">
                <div className={`h3 mb-1 fw-bold ${getAmountClass(mockData.profitAndLoss?.netIncome || 0)}`} data-testid="text-net-income">
                  {formatCurrency(mockData.profitAndLoss?.netIncome || 0)}
                </div>
                <div className="text-muted small">Net Income</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-lg-3 col-md-6">
          <AnimatedCard className="border-0 shadow-sm overflow-hidden h-100">
            <div className="card-body p-4 position-relative">
              <div className="position-absolute top-0 start-0 w-100 bg-info" style={{height: '4px'}}></div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="p-3 bg-info bg-opacity-10 rounded-3">
                  <FaTint className="fs-4 text-info" />
                </div>
                <div className="badge bg-info bg-opacity-10 text-info">Cash Flow</div>
              </div>
              <div className="mb-2">
                <div className={`h3 mb-1 fw-bold ${getAmountClass(mockData.cashFlow?.netCashFlow || 0)}`} data-testid="text-net-cash-flow">
                  {formatCurrency(mockData.cashFlow?.netCashFlow || 0)}
                </div>
                <div className="text-muted small">Net Cash Flow</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Report Controls */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <AnimatedCard className="border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="fas fa-cog me-2 text-primary"></i>
                  Report Configuration
                </h6>
              </div>
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-2">Report Type</label>
                  <select
                    className="form-select"
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value as any)}
                    data-testid="select-report-type"
                  >
                    <option value="profit-loss">Profit & Loss</option>
                    <option value="balance-sheet">Balance Sheet</option>
                    <option value="cash-flow">Cash Flow</option>
                  </select>
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-2">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-2">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-semibold text-muted mb-2">Chart Type</label>
                  <select
                    className="form-select"
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    data-testid="select-chart-type"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Interactive Chart Section */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <AnimatedCard className="border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="fas fa-chart-bar me-2 text-primary"></i>
                  {selectedReport === 'profit-loss' ? 'Revenue vs Expenses' : 
                   selectedReport === 'balance-sheet' ? 'Assets vs Liabilities' :
                   'Cash Flow Analysis'}
                </h6>
                <div className="badge bg-primary bg-opacity-10 text-primary">
                  Interactive Chart
                </div>
              </div>
              {chartData.length > 0 && (
                <div style={{ width: '100%', height: '400px' }}>
                  <ResponsiveContainer>
                    {chartType === 'bar' && (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']} />
                        <Legend />
                        <Bar dataKey="amount" fill={CHART_COLORS[0]} />
                      </BarChart>
                    )}
                    {chartType === 'line' && (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke={CHART_COLORS[1]} strokeWidth={3} />
                      </LineChart>
                    )}
                    {chartType === 'area' && (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']} />
                        <Legend />
                        <Area type="monotone" dataKey="amount" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.3} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Report Content */}
      <div className="row g-4">
        <div className="col-12">
          <AnimatedCard className="border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title mb-0 fw-bold text-dark">
                  <i className="fas fa-file-alt me-2 text-primary"></i>
                  {selectedReport === 'profit-loss' ? 'Profit & Loss Statement' :
                   selectedReport === 'balance-sheet' ? 'Balance Sheet' :
                   'Cash Flow Statement'}
                </h6>
                <div className="text-muted small">
                  {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                </div>
              </div>
              
              {selectedReport === 'profit-loss' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <h6 className="text-success fw-bold border-bottom pb-2 mb-3">REVENUE</h6>
                      {mockData.profitAndLoss?.revenue.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between py-2">
                          <span>{item.accountName}</span>
                          <span className="font-monospace text-success">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                        <span>Total Revenue</span>
                        <span className="font-monospace text-success">{formatCurrency(mockData.profitAndLoss?.totalRevenue || 0)}</span>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <h6 className="text-danger fw-bold border-bottom pb-2 mb-3">EXPENSES</h6>
                      {mockData.profitAndLoss?.expenses.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between py-2">
                          <span>{item.accountName}</span>
                          <span className="font-monospace text-danger">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                        <span>Total Expenses</span>
                        <span className="font-monospace text-danger">{formatCurrency(mockData.profitAndLoss?.totalExpenses || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <div className="d-flex justify-content-between fw-bold h5 mb-0">
                      <span>Net Income</span>
                      <span className={`font-monospace ${getAmountClass(mockData.profitAndLoss?.netIncome || 0)}`}>
                        {formatCurrency(mockData.profitAndLoss?.netIncome || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport === 'balance-sheet' && (
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">ASSETS</h6>
                    <div className="mb-3">
                      <div className="small text-muted mb-2">Current Assets</div>
                      {mockData.balanceSheet?.assets.currentAssets.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between py-1 ps-3">
                          <span className="small">{item.accountName}</span>
                          <span className="font-monospace small">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between fw-semibold border-top pt-2">
                      <span>Total Assets</span>
                      <span className="font-monospace">{formatCurrency(mockData.balanceSheet?.assets.totalAssets || 0)}</span>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <h6 className="text-warning fw-bold border-bottom pb-2 mb-3">LIABILITIES & EQUITY</h6>
                    <div className="mb-3">
                      <div className="small text-muted mb-2">Liabilities</div>
                      {mockData.balanceSheet?.liabilities.currentLiabilities.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between py-1 ps-3">
                          <span className="small">{item.accountName}</span>
                          <span className="font-monospace small">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between fw-semibold border-top pt-2">
                      <span>Total Equity</span>
                      <span className="font-monospace">{formatCurrency(mockData.balanceSheet?.equity.totalEquity || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedReport === 'cash-flow' && (
                <div className="row">
                  <div className="col-md-4 mb-4">
                    <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">OPERATING ACTIVITIES</h6>
                    {mockData.cashFlow?.operatingActivities.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between py-2">
                        <span className="small">{item.description}</span>
                        <span className={`font-monospace small ${getAmountClass(item.amount)}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                      <span>Net Operating Cash</span>
                      <span className={`font-monospace ${getAmountClass(mockData.cashFlow?.netOperatingCash || 0)}`}>
                        {formatCurrency(mockData.cashFlow?.netOperatingCash || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <h6 className="text-info fw-bold border-bottom pb-2 mb-3">INVESTING ACTIVITIES</h6>
                    {mockData.cashFlow?.investingActivities.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between py-2">
                        <span className="small">{item.description}</span>
                        <span className={`font-monospace small ${getAmountClass(item.amount)}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                      <span>Net Investing Cash</span>
                      <span className={`font-monospace ${getAmountClass(mockData.cashFlow?.netInvestingCash || 0)}`}>
                        {formatCurrency(mockData.cashFlow?.netInvestingCash || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4 mb-4">
                    <h6 className="text-warning fw-bold border-bottom pb-2 mb-3">FINANCING ACTIVITIES</h6>
                    {mockData.cashFlow?.financingActivities.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between py-2">
                        <span className="small">{item.description}</span>
                        <span className={`font-monospace small ${getAmountClass(item.amount)}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-2">
                      <span>Net Financing Cash</span>
                      <span className={`font-monospace ${getAmountClass(mockData.cashFlow?.netFinancingCash || 0)}`}>
                        {formatCurrency(mockData.cashFlow?.netFinancingCash || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
                </div>
                <div className="text-muted small">Net Cash Flow</div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

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