import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Settings, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  Share,
  Calendar,
  Filter,
  RefreshCw,
  Save,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Heart,
  Star,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'customers' | 'inventory' | 'financial' | 'marketing' | 'custom';
  type: 'dashboard' | 'summary' | 'detailed' | 'analytics';
  charts: {
    type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
    title: string;
    data: any[];
  }[];
  filters: {
    dateRange: string;
    categories: string[];
    metrics: string[];
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
  };
  isPublic: boolean;
  lastGenerated?: Date;
  views: number;
  createdAt: Date;
  createdBy: string;
}

interface AdvancedReportingProps {
  className?: string;
}

const AdvancedReporting: React.FC<AdvancedReportingProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'builder' | 'templates' | 'scheduled'>('reports');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'orders', 'customers']);

  const reports: Report[] = [
    {
      id: '1',
      name: 'Sales Performance Dashboard',
      description: 'Comprehensive sales analytics with trends and forecasts',
      category: 'sales',
      type: 'dashboard',
      charts: [
        { type: 'line', title: 'Revenue Trend', data: [] },
        { type: 'bar', title: 'Top Products', data: [] },
        { type: 'pie', title: 'Sales by Category', data: [] }
      ],
      filters: {
        dateRange: '30d',
        categories: ['all'],
        metrics: ['revenue', 'orders', 'profit']
      },
      schedule: {
        frequency: 'weekly',
        time: '09:00',
        recipients: ['manager@company.com', 'sales@company.com']
      },
      isPublic: false,
      lastGenerated: new Date('2024-12-20T09:00:00'),
      views: 156,
      createdAt: new Date('2024-11-15'),
      createdBy: 'John Smith'
    },
    {
      id: '2',
      name: 'Customer Analytics Report',
      description: 'Customer behavior analysis and loyalty insights',
      category: 'customers',
      type: 'analytics',
      charts: [
        { type: 'bar', title: 'Customer Acquisition', data: [] },
        { type: 'pie', title: 'Loyalty Distribution', data: [] },
        { type: 'line', title: 'Retention Rate', data: [] }
      ],
      filters: {
        dateRange: '90d',
        categories: ['bronze', 'silver', 'gold'],
        metrics: ['acquisition', 'retention', 'lifetime_value']
      },
      isPublic: true,
      lastGenerated: new Date('2024-12-19T14:30:00'),
      views: 89,
      createdAt: new Date('2024-10-20'),
      createdBy: 'Sarah Johnson'
    },
    {
      id: '3',
      name: 'Inventory Optimization',
      description: 'Stock levels, turnover rates, and reorder recommendations',
      category: 'inventory',
      type: 'summary',
      charts: [
        { type: 'bar', title: 'Stock Levels', data: [] },
        { type: 'line', title: 'Turnover Rates', data: [] },
        { type: 'scatter', title: 'Demand vs Stock', data: [] }
      ],
      filters: {
        dateRange: '60d',
        categories: ['low_stock', 'overstock', 'optimal'],
        metrics: ['stock_level', 'turnover', 'demand']
      },
      isPublic: false,
      lastGenerated: new Date('2024-12-18T16:45:00'),
      views: 67,
      createdAt: new Date('2024-09-10'),
      createdBy: 'Mike Davis'
    },
    {
      id: '4',
      name: 'Financial Health Summary',
      description: 'Revenue, expenses, profit margins, and cash flow analysis',
      category: 'financial',
      type: 'summary',
      charts: [
        { type: 'area', title: 'Revenue vs Expenses', data: [] },
        { type: 'bar', title: 'Profit Margins', data: [] },
        { type: 'line', title: 'Cash Flow', data: [] }
      ],
      filters: {
        dateRange: '12m',
        categories: ['revenue', 'expenses', 'profit'],
        metrics: ['total_revenue', 'total_expenses', 'net_profit']
      },
      schedule: {
        frequency: 'monthly',
        time: '08:00',
        recipients: ['cfo@company.com', 'accounting@company.com']
      },
      isPublic: false,
      lastGenerated: new Date('2024-12-01T08:00:00'),
      views: 234,
      createdAt: new Date('2024-08-05'),
      createdBy: 'Emma Wilson'
    }
  ];

  const reportTemplates = [
    {
      id: '1',
      name: 'Executive Dashboard',
      description: 'High-level business metrics for executives',
      category: 'sales',
      icon: BarChart3,
      charts: ['Revenue Trend', 'Customer Growth', 'Profit Margins'],
      metrics: ['revenue', 'customers', 'profit', 'orders']
    },
    {
      id: '2',
      name: 'Marketing Performance',
      description: 'Campaign effectiveness and customer engagement',
      category: 'marketing',
      icon: Target,
      charts: ['Campaign ROI', 'Conversion Rates', 'Customer Acquisition'],
      metrics: ['roi', 'conversion', 'acquisition', 'engagement']
    },
    {
      id: '3',
      name: 'Operations Report',
      description: 'Operational efficiency and resource utilization',
      category: 'inventory',
      icon: Package,
      charts: ['Inventory Turnover', 'Supplier Performance', 'Order Fulfillment'],
      metrics: ['turnover', 'supplier_score', 'fulfillment_time', 'accuracy']
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return DollarSign;
      case 'customers': return Users;
      case 'inventory': return Package;
      case 'financial': return TrendingUp;
      case 'marketing': return Target;
      default: return BarChart3;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dashboard': return 'primary';
      case 'analytics': return 'info';
      case 'summary': return 'success';
      case 'detailed': return 'warning';
      default: return 'secondary';
    }
  };

  const scheduledReports = reports.filter(r => r.schedule);

  return (
    <div className={`advanced-reporting ${className}`}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">Advanced Reporting</h5>
                <p className="text-muted mb-0">
                  Create, customize, and schedule comprehensive business reports
                </p>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary">
                  <Settings size={16} className="me-2" />
                  Settings
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowBuilder(true)}
                >
                  <Plus size={16} className="me-2" />
                  Create Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <BarChart3 size={24} className="text-primary" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{reports.length}</h3>
              <p className="kpi-title">Total Reports</p>
              <p className="kpi-subtext text-muted small">
                {reports.filter(r => r.isPublic).length} public
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Clock size={24} className="text-info" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">{scheduledReports.length}</h3>
              <p className="kpi-title">Scheduled Reports</p>
              <p className="kpi-subtext text-muted small">Auto-generated</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <Eye size={24} className="text-success" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">
                {reports.reduce((acc, r) => acc + r.views, 0)}
              </h3>
              <p className="kpi-title">Total Views</p>
              <p className="kpi-subtext text-muted small">This month</p>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon">
                <CheckCircle size={24} className="text-warning" />
              </div>
            </div>
            <div className="kpi-content">
              <h3 className="kpi-value">98.5%</h3>
              <p className="kpi-title">Success Rate</p>
              <p className="kpi-subtext text-muted small">Report generation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <ul className="nav nav-tabs border-0" role="tablist">
              {[
                { id: 'reports', label: 'All Reports', icon: BarChart3 },
                { id: 'builder', label: 'Report Builder', icon: Settings },
                { id: 'templates', label: 'Templates', icon: Plus },
                { id: 'scheduled', label: 'Scheduled', icon: Clock }
              ].map((tab) => (
                <li key={tab.id} className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    type="button"
                  >
                    <tab.icon size={16} className="me-2" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="row">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">All Reports</h6>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>All Categories</option>
                    <option>Sales</option>
                    <option>Customers</option>
                    <option>Inventory</option>
                    <option>Financial</option>
                  </select>
                  <button className="btn btn-sm btn-outline-secondary">
                    <Filter size={14} className="me-1" />
                    Filter
                  </button>
                </div>
              </div>
              
              <div className="row g-3">
                {reports.map(report => {
                  const CategoryIcon = getCategoryIcon(report.category);
                  return (
                    <div key={report.id} className="col-lg-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-start">
                              <div className="report-icon me-3">
                                <CategoryIcon size={24} className="text-primary" />
                              </div>
                              <div>
                                <h6 className="card-title fw-bold">{report.name}</h6>
                                <p className="card-text text-muted small mb-2">{report.description}</p>
                                <div className="d-flex gap-2">
                                  <span className={`badge bg-${getTypeColor(report.type)}-subtle text-${getTypeColor(report.type)}`}>
                                    {report.type}
                                  </span>
                                  <span className="badge bg-secondary-subtle text-secondary">
                                    {report.category}
                                  </span>
                                  {report.isPublic && (
                                    <span className="badge bg-success-subtle text-success">
                                      Public
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="report-stats mb-3">
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="stat-item">
                                  <div className="stat-label text-muted small">Charts</div>
                                  <div className="stat-value fw-semibold">{report.charts.length}</div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="stat-item">
                                  <div className="stat-label text-muted small">Views</div>
                                  <div className="stat-value fw-semibold">{report.views}</div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="stat-item">
                                  <div className="stat-label text-muted small">Created</div>
                                  <div className="stat-value fw-semibold small">
                                    {report.createdAt.toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="stat-item">
                                  <div className="stat-label text-muted small">Last Run</div>
                                  <div className="stat-value fw-semibold small">
                                    {report.lastGenerated?.toLocaleDateString() || 'Never'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary flex-fill">
                              <Eye size={14} className="me-1" />
                              View
                            </button>
                            <button className="btn btn-sm btn-outline-secondary flex-fill">
                              <Edit size={14} className="me-1" />
                              Edit
                            </button>
                            <button className="btn btn-sm btn-outline-success flex-fill">
                              <Download size={14} className="me-1" />
                              Export
                            </button>
                            <button className="btn btn-sm btn-outline-info">
                              <Share size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Builder Tab */}
      {activeTab === 'builder' && (
        <div className="row">
          <div className="col-lg-8">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Report Builder</h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary">
                    <Save size={14} className="me-1" />
                    Save Draft
                  </button>
                  <button className="btn btn-sm btn-primary">
                    <BarChart3 size={14} className="me-1" />
                    Generate Report
                  </button>
                </div>
              </div>
              
              <div className="report-builder">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Report Name</label>
                    <input type="text" className="form-control" placeholder="Enter report name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select">
                      <option>Sales</option>
                      <option>Customers</option>
                      <option>Inventory</option>
                      <option>Financial</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Date Range</label>
                    <select className="form-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="90d">Last 90 Days</option>
                      <option value="12m">Last 12 Months</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Report Type</label>
                    <select className="form-select">
                      <option>Dashboard</option>
                      <option>Summary</option>
                      <option>Detailed</option>
                      <option>Analytics</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Format</label>
                    <select className="form-select">
                      <option>Interactive Dashboard</option>
                      <option>PDF Report</option>
                      <option>Excel Spreadsheet</option>
                      <option>CSV Data</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold">Metrics to Include</label>
                  <div className="row g-2">
                    {[
                      { id: 'revenue', name: 'Revenue', icon: DollarSign },
                      { id: 'orders', name: 'Orders', icon: ShoppingCart },
                      { id: 'customers', name: 'Customers', icon: Users },
                      { id: 'products', name: 'Products', icon: Package },
                      { id: 'loyalty', name: 'Loyalty Points', icon: Heart },
                      { id: 'growth', name: 'Growth Rate', icon: TrendingUp }
                    ].map(metric => (
                      <div key={metric.id} className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`metric-${metric.id}`}
                            checked={selectedMetrics.includes(metric.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMetrics(prev => [...prev, metric.id]);
                              } else {
                                setSelectedMetrics(prev => prev.filter(m => m !== metric.id));
                              }
                            }}
                          />
                          <label className="form-check-label d-flex align-items-center" htmlFor={`metric-${metric.id}`}>
                            <metric.icon size={16} className="me-2" />
                            {metric.name}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="report-preview border rounded p-4" style={{ minHeight: '300px' }}>
                  <div className="text-center py-5">
                    <BarChart3 size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">Report Preview</h6>
                    <p className="text-muted small mb-3">
                      Configure your report settings to see a preview
                    </p>
                    <button className="btn btn-primary">
                      <Eye size={16} className="me-2" />
                      Generate Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <h6 className="fw-bold mb-3">Chart Types</h6>
              
              <div className="chart-types">
                <div className="chart-type mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <BarChart3 size={20} className="text-primary me-2" />
                    <span className="fw-semibold">Bar Chart</span>
                  </div>
                  <p className="text-muted small mb-2">Compare values across categories</p>
                  <button className="btn btn-sm btn-outline-primary w-100">
                    Add Chart
                  </button>
                </div>
                
                <div className="chart-type mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <TrendingUp size={20} className="text-success me-2" />
                    <span className="fw-semibold">Line Chart</span>
                  </div>
                  <p className="text-muted small mb-2">Show trends over time</p>
                  <button className="btn btn-sm btn-outline-success w-100">
                    Add Chart
                  </button>
                </div>
                
                <div className="chart-type mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <PieChart size={20} className="text-info me-2" />
                    <span className="fw-semibold">Pie Chart</span>
                  </div>
                  <p className="text-muted small mb-2">Show parts of a whole</p>
                  <button className="btn btn-sm btn-outline-info w-100">
                    Add Chart
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <h6 className="fw-bold mb-3">Scheduling</h6>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="scheduleReport" />
                  <label className="form-check-label" htmlFor="scheduleReport">
                    Schedule automatic generation
                  </label>
                </div>
                <select className="form-select form-select-sm mb-2" disabled>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
                <input type="time" className="form-control form-control-sm" disabled />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="row">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Report Templates</h6>
                <button className="btn btn-primary btn-sm">
                  <Plus size={16} className="me-2" />
                  Create Template
                </button>
              </div>
              
              <div className="row g-3">
                {reportTemplates.map(template => (
                  <div key={template.id} className="col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-start mb-3">
                          <div className="template-icon me-3">
                            <template.icon size={24} className="text-primary" />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="card-title fw-bold">{template.name}</h6>
                            <p className="card-text text-muted small mb-2">{template.description}</p>
                            <span className="badge bg-secondary-subtle text-secondary">
                              {template.category}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <h6 className="small fw-semibold mb-2">Includes:</h6>
                          <ul className="list-unstyled small">
                            {template.charts.map((chart, index) => (
                              <li key={index} className="d-flex align-items-center mb-1">
                                <CheckCircle size={12} className="text-success me-2" />
                                {chart}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-primary flex-fill">
                            <Eye size={14} className="me-1" />
                            Preview
                          </button>
                          <button className="btn btn-sm btn-primary flex-fill">
                            <Plus size={14} className="me-1" />
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="row">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Scheduled Reports</h6>
                <button className="btn btn-primary btn-sm">
                  <Plus size={16} className="me-2" />
                  Schedule Report
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Frequency</th>
                      <th>Next Run</th>
                      <th>Recipients</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledReports.map(report => (
                      <tr key={report.id}>
                        <td>
                          <div className="fw-semibold">{report.name}</div>
                          <div className="text-muted small">{report.description}</div>
                        </td>
                        <td>
                          <span className="badge bg-info-subtle text-info">
                            {report.schedule?.frequency}
                          </span>
                        </td>
                        <td>
                          <div className="small">
                            {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </div>
                          <div className="text-muted small">
                            {report.schedule?.time}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            {report.schedule?.recipients.length} recipients
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success d-flex align-items-center">
                            <CheckCircle size={12} className="me-1" />
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-primary">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-success">
                              <Play size={14} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger">
                              <Trash2 size={14} />
                            </button>
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
    </div>
  );
};

export default AdvancedReporting;
