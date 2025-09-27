import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { useQuery } from '@tanstack/react-query';
import AnimatedKPICard from '@/components/ui/AnimatedKPICard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// 3D Components
import SalesVisualization from '../components/3d/SalesVisualization';
import ProductDistribution from '../components/3d/ProductDistribution';
import RevenueFlow from '../components/3d/RevenueFlow';
import CustomerLoyalty3D from '../components/3d/CustomerLoyalty3D';

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

  // 3D Data
  const sales3DData = [
    { month: 'Jan', sales: 2400, maxSales: 10000 },
    { month: 'Feb', sales: 1398, maxSales: 10000 },
    { month: 'Mar', sales: 9800, maxSales: 10000 },
    { month: 'Apr', sales: 3908, maxSales: 10000 },
    { month: 'May', sales: 4800, maxSales: 10000 },
    { month: 'Jun', sales: 3800, maxSales: 10000 },
  ];

  const product3DData = [
    { name: 'Electronics', value: 35, color: '#3B82F6' },
    { name: 'Clothing', value: 25, color: '#10B981' },
    { name: 'Home & Garden', value: 20, color: '#F59E0B' },
    { name: 'Sports', value: 15, color: '#EF4444' },
    { name: 'Books', value: 5, color: '#8B5CF6' },
  ];

  const revenue3DData = [
    { source: 'Online Sales', amount: 18500, color: '#10B981' },
    { source: 'Retail Stores', amount: 12000, color: '#3B82F6' },
    { source: 'Wholesale', amount: 8500, color: '#F59E0B' },
    { source: 'Subscriptions', amount: 3200, color: '#8B5CF6' },
  ];

  const loyalty3DData = [
    { tier: 'Bronze', count: 400, color: '#CD7F32', height: 1.5 },
    { tier: 'Silver', count: 300, color: '#C0C0C0', height: 2.0 },
    { tier: 'Gold', count: 200, color: '#FFD700', height: 2.5 },
    { tier: 'Platinum', count: 100, color: '#E5E4E2', height: 3.0 },
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
      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card bg-gradient-shopify text-white p-4 animate-fade-in-up">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
                  style={{width: '60px', height: '60px'}}
                >
                  <i className="fas fa-chart-line fa-lg text-white"></i>
                </div>
              </div>
              <div>
                <h2 className="h3 fw-bold mb-1">Welcome back, {user?.name}! 👋</h2>
                <p className="mb-0 text-white-50">Here's what's happening with your business today.</p>
              </div>
            </div>
          </div>
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
        {/* Sales Trends Chart */}
        <div className="col-lg-8">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-chart-line me-2 text-success"></i>
                Sales Trends
              </h5>
              <span className="badge bg-success-subtle text-success px-3 py-2">
                Last 7 days
              </span>
            </div>
            <div style={{height: '300px'}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
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
                    dataKey="sales" 
                    stroke="var(--shopify-green)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--shopify-green)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--shopify-dark-green)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Loyalty Distribution Chart */}
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-heart me-2 text-danger"></i>
                Customer Loyalty Tiers
              </h5>
            </div>
            <div style={{height: '300px'}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockLoyaltyTiers}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockLoyaltyTiers.map((entry, index) => (
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

      {/* 3D Visualizations Row */}
      <div className="row g-4 mb-4">
        {/* 3D Sales Visualization */}
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-cube me-2 text-primary"></i>
                3D Sales Trends
              </h5>
              <span className="badge bg-primary-subtle text-primary px-3 py-2">
                Interactive
              </span>
            </div>
            <SalesVisualization data={sales3DData} width="100%" height={300} />
          </div>
        </div>

        {/* 3D Product Distribution */}
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-globe me-2 text-info"></i>
                3D Product Distribution
              </h5>
              <span className="badge bg-info-subtle text-info px-3 py-2">
                Real-time
              </span>
            </div>
            <ProductDistribution data={product3DData} width="100%" height={300} />
          </div>
        </div>
      </div>

      {/* 3D Revenue & Loyalty Row */}
      <div className="row g-4 mb-4">
        {/* 3D Revenue Flow */}
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-coins me-2 text-warning"></i>
                3D Revenue Sources
              </h5>
              <span className="badge bg-warning-subtle text-warning px-3 py-2">
                Animated
              </span>
            </div>
            <RevenueFlow data={revenue3DData} width="100%" height={300} />
          </div>
        </div>

        {/* 3D Customer Loyalty */}
        <div className="col-lg-6">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fas fa-crown me-2 text-danger"></i>
                3D Loyalty Pyramid
              </h5>
              <span className="badge bg-danger-subtle text-danger px-3 py-2">
                Dynamic
              </span>
            </div>
            <CustomerLoyalty3D data={loyalty3DData} width="100%" height={300} />
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
    </div>
  );
};

export default Dashboard;