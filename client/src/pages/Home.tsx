import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { useQuery } from '@tanstack/react-query';
import AnimatedKPICard from '@/components/ui/AnimatedKPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Advanced Components

// New Advanced Components
import RecentActivity from '../components/RecentActivity';
import WeatherWidget from '../components/WeatherWidget';
import MarketTrends from '../components/MarketTrends';
import AIChat from '../components/AIChat';
import NotificationCenter from '../components/NotificationCenter';
import AdvancedDashboard from '../components/AdvancedDashboard';
import DataExportImport from '../components/DataExportImport';
import WorkflowAutomation from '../components/WorkflowAutomation';
import GlobalSearch from '../components/GlobalSearch';
import SystemMonitoring from '../components/SystemMonitoring';
import BackupRestore from '../components/BackupRestore';
import ThemeSettings from '../components/ThemeSettings';
import MobileOptimization from '../components/MobileOptimization';
// import RealTimeNotifications from '../components/RealTimeNotifications';
import QuickActions from '../components/QuickActions';
import LiveDashboardWidgets from '../components/LiveDashboardWidgets';

const Dashboard = () => {
  const { user, token } = useAppSelector((state) => state.auth);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/stats'],
    enabled: !!token,
  });

  const { data: salesTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/analytics/sales-trends'],
    enabled: !!token,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/analytics/top-products'],
    enabled: !!token,
  });

  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['/analytics/loyalty-points'],
    enabled: !!token,
  });

  const { data: businessInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/ai/business-insights'],
    enabled: !!token,
  });

  // New features data
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['/recent-activity'],
    enabled: !!token,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/alerts', user?.role],
    enabled: !!token,
  });

  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['/weather'],
    enabled: !!token,
  });

  const { data: marketTrends, isLoading: marketLoading } = useQuery({
    queryKey: ['/market-trends'],
    enabled: !!token,
  });

  const mockKPIData = [
    {
      title: 'Total Revenue',
      value: '$24,580',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: 'fas fa-dollar-sign',
      gradient: 'shopify' as const
    },
    {
      title: 'Total Orders',
      value: '1,205',
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: 'fas fa-shopping-cart',
      gradient: 'blue' as const
    },
    {
      title: 'Active Customers',
      value: '849',
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: 'fas fa-users',
      gradient: 'purple' as const
    },
    {
      title: 'Products in Stock',
      value: '2,847',
      change: '-3.1%',
      changeType: 'negative' as const,
      icon: 'fas fa-boxes',
      gradient: 'coral' as const
    }
  ];

  const mockSalesData = [
    { date: '2024-01-01', sales: 2400 },
    { date: '2024-01-02', sales: 1398 },
    { date: '2024-01-03', sales: 9800 },
    { date: '2024-01-04', sales: 3908 },
    { date: '2024-01-05', sales: 4800 },
    { date: '2024-01-06', sales: 3800 },
    { date: '2024-01-07', sales: 4300 },
  ];

  const mockLoyaltyTiers = [
    { name: 'Bronze', value: 400, color: '#CD7F32' },
    { name: 'Silver', value: 300, color: '#C0C0C0' },
    { name: 'Gold', value: 200, color: '#FFD700' },
    { name: 'Platinum', value: 100, color: '#E5E4E2' },
  ];

  // Chart Data
  const salesChartData = [
    { month: 'Jan', sales: 2400, profit: 1800 },
    { month: 'Feb', sales: 1398, profit: 1050 },
    { month: 'Mar', sales: 9800, profit: 7350 },
    { month: 'Apr', sales: 3908, profit: 2931 },
    { month: 'May', sales: 4800, profit: 3600 },
    { month: 'Jun', sales: 3800, profit: 2850 },
  ];

  const productChartData = [
    { name: 'Electronics', value: 35, color: '#3B82F6' },
    { name: 'Clothing', value: 25, color: '#10B981' },
    { name: 'Home & Garden', value: 20, color: '#F59E0B' },
    { name: 'Sports', value: 15, color: '#EF4444' },
    { name: 'Books', value: 5, color: '#8B5CF6' },
  ];

  const revenueChartData = [
    { source: 'Online Sales', amount: 18500, color: '#10B981' },
    { source: 'Retail Stores', amount: 12000, color: '#3B82F6' },
    { source: 'Wholesale', amount: 8500, color: '#F59E0B' },
    { source: 'Subscriptions', amount: 3200, color: '#8B5CF6' },
  ];

  const loyaltyChartData = [
    { tier: 'Bronze', customers: 400, color: '#CD7F32' },
    { tier: 'Silver', customers: 300, color: '#C0C0C0' },
    { tier: 'Gold', customers: 200, color: '#FFD700' },
    { tier: 'Platinum', customers: 100, color: '#E5E4E2' },
  ];

  if (statsLoading) {
    return (
      <div className="container-fluid">
        <div className="row g-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-xl-3 col-lg-6">
              <div className="modern-card p-4">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 mb-2"></span>
                  <span className="placeholder col-4 mb-2 bg-secondary"></span>
                  <span className="placeholder col-3"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="modern-card p-4">
              <div className="placeholder-glow">
                <span className="placeholder col-4 mb-3"></span>
                <span className="placeholder w-100" style={{height: '300px'}}></span>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="modern-card p-4">
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-3"></span>
                <span className="placeholder w-100" style={{height: '300px'}}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Enhanced Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4 position-relative overflow-hidden animate-fade-in-up" style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white'
          }}>
            <div className="welcome-background"></div>
            <div className="d-flex align-items-center position-relative">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 floating"
                  style={{width: '60px', height: '60px'}}
                >
                  <i className="fas fa-chart-line fa-lg text-white"></i>
                </div>
              </div>
              <div className="flex-grow-1">
                <h2 className="h3 fw-bold mb-1 fade-in">Welcome back, {user?.name}! 👋</h2>
                <p className="mb-0 text-white-50 slide-in-left">Here's what's happening with your business today.</p>
                <div className="mt-3">
                  <div className="d-flex gap-4">
                    <div className="quick-stat">
                      <div className="quick-stat-value">{(stats as any)?.totalProducts || 0}</div>
                      <div className="quick-stat-label">Products</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-value">{(stats as any)?.totalLoyaltyPoints || 0}</div>
                      <div className="quick-stat-label">Loyalty Points</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-value">{(stats as any)?.lowStockItems || 0}</div>
                      <div className="quick-stat-label">Low Stock</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-end">
                <div className="last-updated">
                  <div className="text-white-50 small">Last updated</div>
                  <div className="fw-semibold pulse">{new Date().toLocaleTimeString()}</div>
                </div>
                {weatherData && typeof weatherData === 'object' && (weatherData as any).temperature && (
                  <div className="d-flex align-items-center gap-2 mt-2 justify-content-end">
                    <i className="fas fa-cloud-sun text-warning"></i>
                    <span className="small text-white">{String((weatherData as any).temperature)}°C</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Dashboard Section */}
      <div className="row mb-4">
        <div className="col-12">
          <AdvancedDashboard />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        {mockKPIData.map((kpi, index) => (
          <div key={index} className="col-xl-3 col-lg-6">
            <AnimatedKPICard {...kpi} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Enhanced Sales Trends Chart */}
        <div className="col-lg-8">
          <div className="chart-card">
            <div className="chart-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="chart-title">
                  <div className="chart-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  Sales Trends
                </h5>
                <span className="chart-badge">
                  Last 7 days
                </span>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--gray-600)" 
                    fontSize={12}
                    tick={{ fill: 'var(--gray-600)' }}
                  />
                  <YAxis 
                    stroke="var(--gray-600)" 
                    fontSize={12}
                    tick={{ fill: 'var(--gray-600)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)',
                      fontSize: 'var(--text-sm)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--accent-primary)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--accent-primary-dark)', stroke: 'white', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Enhanced Loyalty Distribution Chart */}
        <div className="col-lg-4">
          <div className="chart-card">
            <div className="chart-header">
              <h5 className="chart-title">
                <div className="chart-icon">
                  <i className="fas fa-heart"></i>
                </div>
                Customer Loyalty Tiers
              </h5>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockLoyaltyTiers}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {mockLoyaltyTiers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)',
                      fontSize: 'var(--text-sm)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Row */}
      <div className="row g-4 mb-4">
        {/* Sales Trends Chart */}
        <div className="col-lg-6">
          <div className="chart-card">
            <div className="chart-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="chart-title">
                  <div className="chart-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  Sales & Profit Trends
                </h5>
                <span className="chart-badge">
                  Interactive
                </span>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                  <XAxis dataKey="month" stroke="var(--gray-600)" />
                  <YAxis stroke="var(--gray-600)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)'
                    }} 
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Distribution Chart */}
        <div className="col-lg-6">
          <div className="chart-card">
            <div className="chart-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="chart-title">
                  <div className="chart-icon">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  Product Categories
                </h5>
                <span className="chart-badge">
                  Real-time
                </span>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Loyalty Charts Row */}
      <div className="row g-4 mb-4">
        {/* Revenue Sources Chart */}
        <div className="col-lg-6">
          <div className="chart-card">
            <div className="chart-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="chart-title">
                  <div className="chart-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  Revenue Sources
                </h5>
                <span className="chart-badge">
                  Detailed
                </span>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                  <XAxis type="number" stroke="var(--gray-600)" />
                  <YAxis dataKey="source" type="category" stroke="var(--gray-600)" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)'
                    }} 
                  />
                  <Bar dataKey="amount" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Customer Loyalty Chart */}
        <div className="col-lg-6">
          <div className="chart-card">
            <div className="chart-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="chart-title">
                  <div className="chart-icon">
                    <i className="fas fa-crown"></i>
                  </div>
                  Customer Loyalty Tiers
                </h5>
                <span className="chart-badge">
                  Active
                </span>
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loyaltyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
                  <XAxis dataKey="tier" stroke="var(--gray-600)" />
                  <YAxis stroke="var(--gray-600)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow-lg)'
                    }} 
                  />
                  <Bar dataKey="customers" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="fas fa-bolt me-2 text-warning"></i>
              Quick Actions
            </h5>
            <div className="d-grid gap-2">
              <button className="btn btn-coral d-flex align-items-center justify-content-start">
                <i className="fas fa-plus me-2"></i>
                Add New Product
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center justify-content-start">
                <i className="fas fa-users me-2"></i>
                Manage Customers
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center justify-content-start">
                <i className="fas fa-credit-card me-2"></i>
                Process Orders
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
              Alerts
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center p-3 bg-warning-subtle rounded-3">
                <div className="bg-warning rounded-circle me-3" style={{width: '8px', height: '8px'}}></div>
                <div className="flex-fill">
                  <p className="small fw-semibold text-warning-emphasis mb-0">Low Stock Alert</p>
                  <p className="small text-warning mb-0">5 products below threshold</p>
                </div>
              </div>
              <div className="d-flex align-items-center p-3 bg-info-subtle rounded-3">
                <div className="bg-info rounded-circle me-3" style={{width: '8px', height: '8px'}}></div>
                <div className="flex-fill">
                  <p className="small fw-semibold text-info-emphasis mb-0">New Orders</p>
                  <p className="small text-info mb-0">12 orders pending review</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="fas fa-clock me-2 text-primary"></i>
              Recent Activity
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center">
                <div className="bg-success-subtle rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '35px', height: '35px'}}>
                  <i className="fas fa-chart-line text-success"></i>
                </div>
                <div className="flex-fill">
                  <p className="small fw-semibold mb-0">Sale completed</p>
                  <p className="small text-muted mb-0">Order #1234 - $156.00</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="bg-info-subtle rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '35px', height: '35px'}}>
                  <i className="fas fa-users text-info"></i>
                </div>
                <div className="flex-fill">
                  <p className="small fw-semibold mb-0">New customer</p>
                  <p className="small text-muted mb-0">John Doe joined</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <div className="bg-coral-accent bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '35px', height: '35px'}}>
                  <i className="fas fa-boxes text-coral-accent"></i>
                </div>
                <div className="flex-fill">
                  <p className="small fw-semibold mb-0">Inventory updated</p>
                  <p className="small text-muted mb-0">50 items restocked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Advanced Features Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <RecentActivity />
        </div>
        <div className="col-lg-4">
          <WeatherWidget />
        </div>
        <div className="col-lg-4">
          <MarketTrends />
        </div>
      </div>

        {/* Data Export/Import Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <DataExportImport />
          </div>
        </div>

        {/* Workflow Automation Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <WorkflowAutomation />
          </div>
        </div>

        {/* Global Search Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <GlobalSearch />
          </div>
        </div>

        {/* System Monitoring Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <SystemMonitoring />
          </div>
        </div>

        {/* Backup & Restore Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <BackupRestore />
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <ThemeSettings />
          </div>
        </div>

        {/* Mobile Optimization Section */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <MobileOptimization />
          </div>
        </div>

      {/* Live Dashboard Widgets */}
      <LiveDashboardWidgets />

      {/* Quick Actions */}
      <QuickActions />

      {/* Real-time Notifications */}
      {/* <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-end">
            <RealTimeNotifications />
          </div>
        </div>
      </div> */}

      {/* AI Chat and Notifications */}
      <AIChat />
      <NotificationCenter />
    </div>
  );
};

export default Dashboard;