import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle,
  Heart,
  CreditCard
} from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user, token } = useAuth();

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const { data: salesTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/analytics/sales-trends/30'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/sales-trends/30', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch sales trends');
      return response.json();
    },
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/analytics/top-products/30'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/top-products/30', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch top products');
      return response.json();
    },
  });

  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['/api/analytics/loyalty-points'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/loyalty-points', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch loyalty data');
      return response.json();
    },
  });

  const { data: businessInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai/business-insights'],
    queryFn: async () => {
      const response = await fetch('/api/ai/business-insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch business insights');
      return response.json();
    },
  });

  const mockKPIData = [
    {
      title: 'Total Revenue',
      value: '$24,580',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'emerald' as const
    },
    {
      title: 'Total Orders',
      value: '1,205',
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      gradient: 'blue' as const
    },
    {
      title: 'Active Customers',
      value: '849',
      change: '+15.2%',
      changeType: 'positive' as const,
      icon: Users,
      gradient: 'purple' as const
    },
    {
      title: 'Products in Stock',
      value: '2,847',
      change: '-3.1%',
      changeType: 'negative' as const,
      icon: Package,
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

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-coral-500 to-emerald-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-coral-100">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mockKPIData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trends Chart */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Sales Trends</CardTitle>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                Last 7 days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#059669' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loyalty Distribution Chart */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Customer Loyalty Tiers</CardTitle>
              <Heart className="h-5 w-5 text-coral-500" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-coral-500 hover:bg-coral-600">
              <Package className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Customers
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Process Orders
            </Button>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Low Stock Alert</p>
                <p className="text-xs text-amber-600">5 products below threshold</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">New Orders</p>
                <p className="text-xs text-blue-600">12 orders pending review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sale completed</p>
                <p className="text-xs text-gray-500">Order #1234 - $156.00</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New customer</p>
                <p className="text-xs text-gray-500">John Doe joined</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-coral-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Inventory updated</p>
                <p className="text-xs text-gray-500">50 items restocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;