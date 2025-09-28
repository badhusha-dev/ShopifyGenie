import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings
} from 'lucide-react';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';

interface AdvancedDashboardProps {
  className?: string;
}

const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ className = '' }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realTimeData, setRealTimeData] = useState({
    revenue: 24567,
    orders: 3456,
    customers: 1247,
    conversionRate: 3.2
  });

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    onDataUpdate: (update) => {
      if (update.entity === 'order') {
        setRealTimeData(prev => ({
          ...prev,
          orders: prev.orders + 1,
          revenue: prev.revenue + Math.floor(Math.random() * 100) + 50
        }));
      }
    }
  });

  // Real-time data simulation
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
        // Simulate real-time data updates
        setRealTimeData(prev => ({
          ...prev,
          revenue: prev.revenue + Math.floor(Math.random() * 50) - 25,
          orders: prev.orders + Math.floor(Math.random() * 3),
          customers: prev.customers + Math.floor(Math.random() * 2),
          conversionRate: Math.max(2.5, Math.min(4.5, prev.conversionRate + (Math.random() - 0.5) * 0.2))
        }));
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const kpiMetrics = [
    {
      title: 'Total Revenue',
      value: `$${realTimeData.revenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'success',
      subtext: 'vs last period'
    },
    {
      title: 'Active Customers',
      value: realTimeData.customers.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'primary',
      subtext: 'new this month'
    },
    {
      title: 'Orders Processed',
      value: realTimeData.orders.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: Package,
      color: 'info',
      subtext: 'pending: 23'
    },
    {
      title: 'Conversion Rate',
      value: `${realTimeData.conversionRate.toFixed(1)}%`,
      change: '-2.1%',
      trend: 'down',
      icon: Target,
      color: 'warning',
      subtext: 'needs attention'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Low Stock Alert',
      message: '5 products are running low on inventory',
      time: '2 minutes ago',
      icon: AlertTriangle,
      action: 'View Products'
    },
    {
      id: 2,
      type: 'success',
      title: 'Payment Received',
      message: 'Order #12345 payment of $245.67 received',
      time: '5 minutes ago',
      icon: CheckCircle,
      action: 'View Order'
    },
    {
      id: 3,
      type: 'info',
      title: 'New Customer',
      message: 'Sarah Johnson registered and made first purchase',
      time: '12 minutes ago',
      icon: Users,
      action: 'View Profile'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Placed',
      description: 'Order #12346 for $89.99',
      user: 'John Smith',
      time: '2 min ago',
      icon: Package,
      color: 'success'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Processed',
      description: '$156.78 payment received',
      user: 'System',
      time: '5 min ago',
      icon: DollarSign,
      color: 'info'
    },
    {
      id: 3,
      type: 'customer',
      title: 'Customer Registered',
      description: 'New customer account created',
      user: 'Emma Davis',
      time: '8 min ago',
      icon: Users,
      color: 'primary'
    },
    {
      id: 4,
      type: 'inventory',
      title: 'Stock Updated',
      description: 'Product "Organic Tea" stock adjusted',
      user: 'Admin',
      time: '15 min ago',
      icon: Package,
      color: 'warning'
    }
  ];

  const topProducts = [
    { name: 'Organic Green Tea', sales: 156, revenue: '$2,340', growth: '+15%' },
    { name: 'Premium Coffee Beans', sales: 134, revenue: '$1,890', growth: '+8%' },
    { name: 'Herbal Tea Blend', sales: 98, revenue: '$1,470', growth: '+23%' },
    { name: 'Chamomile Tea', sales: 87, revenue: '$1,305', growth: '+12%' }
  ];

  return (
    <div className={`advanced-dashboard ${className}`}>
      {/* Header Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-1">Advanced Analytics Dashboard</h5>
                <p className="text-muted mb-0">
                  Real-time business insights and performance metrics
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="autoRefresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="autoRefresh">
                    Auto Refresh
                  </label>
                </div>
                <select
                  className="form-select form-select-sm"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline-primary btn-sm">
                  <Download size={16} className="me-1" />
                  Export
                </button>
                <button className="btn btn-primary btn-sm">
                  <Settings size={16} className="me-1" />
                  Configure
                </button>
              </div>
            </div>
            {autoRefresh && (
              <div className="mt-3 d-flex align-items-center text-muted small">
                <RefreshCw size={14} className="me-2" />
                Last updated: {lastUpdated.toLocaleTimeString()}
                <span className="ms-2 badge bg-success-subtle text-success">
                  Live
                </span>
                {isConnected && (
                  <span className="ms-2 badge bg-primary-subtle text-primary">
                    WebSocket Connected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="row mb-4">
        {kpiMetrics.map((metric, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-3">
            <div className="kpi-card h-100">
              <div className="kpi-header">
                <div className="kpi-icon">
                  <metric.icon size={24} className={`text-${metric.color}`} />
                </div>
                <div className="kpi-trend">
                  {metric.trend === 'up' ? (
                    <TrendingUp size={16} className="text-success" />
                  ) : (
                    <TrendingDown size={16} className="text-danger" />
                  )}
                  <span className={`small fw-semibold ${
                    metric.trend === 'up' ? 'text-success' : 'text-danger'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="kpi-content">
                <h3 className="kpi-value">{metric.value}</h3>
                <p className="kpi-title">{metric.title}</p>
                <p className="kpi-subtext text-muted small">{metric.subtext}</p>
              </div>
              <div className="kpi-chart">
                <div className="mini-chart">
                  <div className="chart-line" style={{
                    height: '20px',
                    background: `linear-gradient(90deg, var(--accent-${metric.color}) 0%, var(--accent-${metric.color}-dark) 100%)`,
                    borderRadius: '10px',
                    opacity: 0.7
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Revenue Trends</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary">
                  <LineChart size={14} />
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <BarChart3 size={14} />
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <PieChart size={14} />
                </button>
              </div>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={[
                  { month: 'Jan', revenue: 20000, profit: 15000 },
                  { month: 'Feb', revenue: 22000, profit: 16500 },
                  { month: 'Mar', revenue: 25000, profit: 18750 },
                  { month: 'Apr', revenue: 28000, profit: 21000 },
                  { month: 'May', revenue: 30000, profit: 22500 },
                  { month: 'Jun', revenue: realTimeData.revenue, profit: realTimeData.revenue * 0.75 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#059669', stroke: 'white', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#2563EB', stroke: 'white', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Top Products</h6>
              <button className="btn btn-sm btn-outline-primary">
                <Eye size={14} />
              </button>
            </div>
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="product-item d-flex justify-content-between align-items-center mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="rank-badge me-2">{index + 1}</div>
                      <div>
                        <div className="fw-semibold small">{product.name}</div>
                        <div className="text-muted small">{product.sales} sales</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold small">{product.revenue}</div>
                    <div className={`small fw-semibold ${product.growth.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      {product.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Activities */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">System Alerts</h6>
              <span className="badge bg-warning">{alerts.length}</span>
            </div>
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item alert-${alert.type} mb-3`}>
                  <div className="d-flex align-items-start">
                    <div className="alert-icon me-3">
                      <alert.icon size={20} className={`text-${alert.type}`} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold small">{alert.title}</div>
                      <div className="text-muted small mb-2">{alert.message}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">{alert.time}</span>
                        <button className="btn btn-sm btn-outline-primary">
                          {alert.action}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Recent Activity</h6>
              <button className="btn btn-sm btn-outline-primary">
                <Eye size={14} />
              </button>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item d-flex align-items-center mb-3">
                  <div className={`activity-icon me-3 bg-${activity.color}-subtle`}>
                    <activity.icon size={16} className={`text-${activity.color}`} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small">{activity.title}</div>
                    <div className="text-muted small">{activity.description}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">{activity.time}</div>
                    <div className="text-muted small">{activity.user}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="row">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Performance Metrics</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary">
                  <Filter size={14} />
                </button>
                <button className="btn btn-sm btn-outline-primary">
                  <Calendar size={14} />
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-3 col-md-6">
                <div className="metric-card text-center p-3">
                  <div className="metric-icon mb-2">
                    <Activity size={24} className="text-primary" />
                  </div>
                  <div className="metric-value fw-bold">99.9%</div>
                  <div className="metric-label text-muted small">Uptime</div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="metric-card text-center p-3">
                  <div className="metric-icon mb-2">
                    <Zap size={24} className="text-success" />
                  </div>
                  <div className="metric-value fw-bold">245ms</div>
                  <div className="metric-label text-muted small">Avg Response</div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="metric-card text-center p-3">
                  <div className="metric-icon mb-2">
                    <Users size={24} className="text-info" />
                  </div>
                  <div className="metric-value fw-bold">1,247</div>
                  <div className="metric-label text-muted small">Active Users</div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="metric-card text-center p-3">
                  <div className="metric-icon mb-2">
                    <Package size={24} className="text-warning" />
                  </div>
                  <div className="metric-value fw-bold">3,456</div>
                  <div className="metric-label text-muted small">Orders Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
