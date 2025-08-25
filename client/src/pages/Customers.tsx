
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Search, 
  Mail,
  Phone,
  MapPin,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Eye,
  Award,
  ShoppingBag,
  Calendar,
  CreditCard,
  TrendingUp,
  UserCheck,
  Crown,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedKPICard from '../components/ui/AnimatedKPICard';
import AnimatedModal from '../components/ui/AnimatedModal';
import DataTable from '../components/ui/DataTable';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  tier: string;
  totalSpent: string;
  lastOrderDate?: string;
  ordersCount?: number;
  createdAt: Date;
  shopifyId?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  loyaltyPointsIssued: number;
  avgLifetimeValue: number;
}

interface LoyaltyTier {
  name: string;
  count: number;
  color: string;
  percentage: number;
}

interface CustomerOrder {
  id: string;
  total: string;
  status: string;
  createdAt: Date;
  pointsEarned: number;
}

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: 'earned' | 'redeemed';
  createdAt: Date;
  description?: string;
}

const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Customer data queries
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    }
  });

  const { data: loyaltyTiers = [] } = useQuery({
    queryKey: ['loyalty/tier-distribution'],
    queryFn: async () => {
      const response = await fetch('/api/loyalty/tier-distribution');
      if (!response.ok) throw new Error('Failed to fetch tier distribution');
      return response.json();
    }
  });

  const { data: customerOrders = [] } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const response = await fetch(`/api/orders?customerId=${selectedCustomer.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedCustomer
  });

  const { data: loyaltyTransactions = [] } = useQuery({
    queryKey: ['loyalty-transactions', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const response = await fetch(`/api/loyalty/transactions?customerId=${selectedCustomer.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedCustomer
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await fetch(`/api/customers/${customerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error('Failed to update customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    }
  });

  // Calculate customer stats
  const customerStats: CustomerStats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c: Customer) => 
      c.lastOrderDate && new Date(c.lastOrderDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    ).length;
    const totalSpent = customers.reduce((sum: number, c: Customer) => sum + parseFloat(c.totalSpent || '0'), 0);
    const loyaltyPointsIssued = customers.reduce((sum: number, c: Customer) => sum + (c.loyaltyPoints || 0), 0);
    const avgLifetimeValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;
    
    return {
      totalCustomers,
      activeCustomers,
      loyaltyPointsIssued,
      avgLifetimeValue
    };
  }, [customers]);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter((customer: Customer) => {
      const matchesSearch = (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTier = selectedTierFilter === 'all' || (customer.tier && customer.tier === selectedTierFilter);
      const isActive = customer.lastOrderDate && new Date(customer.lastOrderDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const matchesStatus = selectedStatusFilter === 'all' || 
        (selectedStatusFilter === 'active' && isActive) ||
        (selectedStatusFilter === 'inactive' && !isActive);
      
      return matchesSearch && matchesTier && matchesStatus;
    });

    // Sort customers
    filtered.sort((a: Customer, b: Customer) => {
      let aValue: any = a[sortKey as keyof Customer];
      let bValue: any = b[sortKey as keyof Customer];
      
      if (sortKey === 'totalSpent') {
        aValue = parseFloat(a.totalSpent || '0');
        bValue = parseFloat(b.totalSpent || '0');
      } else if (sortKey === 'loyaltyPoints') {
        aValue = a.loyaltyPoints || 0;
        bValue = b.loyaltyPoints || 0;
      }
      
      if (typeof aValue === 'string' && aValue) {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string' && bValue) {
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [customers, searchTerm, selectedTierFilter, selectedStatusFilter, sortKey, sortDirection]);

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setSelectedCustomer(null);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsProfileModalOpen(true);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0', 
      gold: '#FFD700',
      platinum: '#E5E4E2'
    };
    return colors[(tier && tier.toLowerCase()) as keyof typeof colors] || colors.bronze;
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier && tier.toLowerCase()) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusBadge = (customer: Customer) => {
    const isActive = customer.lastOrderDate && 
      new Date(customer.lastOrderDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return isActive ? 
      { label: 'Active', class: 'bg-emerald-100 text-emerald-800' } :
      { label: 'Inactive', class: 'bg-gray-100 text-gray-600' };
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ ...formData, id: selectedCustomer.id });
    } else {
      createCustomerMutation.mutate(formData);
    }
  };


  // Chart data
  const loyaltyDistributionData = loyaltyTiers.map((tier: LoyaltyTier) => ({
    name: tier.name,
    value: tier.count,
    color: getTierColor(tier.name)
  }));

  const topCustomersData = filteredAndSortedCustomers
    .slice(0, 10)
    .map((customer: Customer) => ({
      name: customer.name ? customer.name.split(' ')[0] : 'Unknown',
      orders: customer.ordersCount || 0,
      value: parseFloat(customer.totalSpent || '0')
    }));

  const customerGrowthData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2024, i).toLocaleDateString('en', { month: 'short' }),
    customers: Math.floor(Math.random() * 50) + 20 + i * 5
  }));

  if (isLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="row mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-lg-3 col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h2 fw-bold text-dark mb-1">Customer Management</h1>
              <p className="text-muted mb-0">Manage relationships, loyalty, and customer insights</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="btn btn-primary btn-ripple d-flex align-items-center"
                  onClick={resetForm}
                >
                  <Plus className="me-2" size={16} />
                  Add Customer
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="col-12">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="form-control"
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-end gap-2 pt-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn btn-primary">
                      {selectedCustomer ? 'Update' : 'Create'} Customer
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <AnimatedKPICard
            title="Total Customers"
            value={customerStats.totalCustomers.toLocaleString()}
            change="+12.5%"
            changeType="positive"
            icon="fas fa-users"
            gradient="shopify"
            className="h-100"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <AnimatedKPICard
            title="Active Customers"
            value={customerStats.activeCustomers.toLocaleString()}
            change="+8.3%"
            changeType="positive"
            icon="fas fa-user-check"
            gradient="blue"
            className="h-100"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <AnimatedKPICard
            title="Loyalty Points Issued"
            value={customerStats.loyaltyPointsIssued.toLocaleString()}
            change="+24.1%"
            changeType="positive"
            icon="fas fa-star"
            gradient="purple"
            className="h-100"
          />
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <AnimatedKPICard
            title="Avg Lifetime Value"
            value={`$${customerStats.avgLifetimeValue.toFixed(2)}`}
            change="+15.7%"
            changeType="positive"
            icon="fas fa-dollar-sign"
            gradient="coral"
            className="h-100"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="position-relative">
            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <Select value={selectedTierFilter} onValueChange={setSelectedTierFilter}>
            <SelectTrigger className="form-select">
              <SelectValue placeholder="Filter by tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-md-2 mb-3">
          <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
            <SelectTrigger className="form-select">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-md-2 mb-3">
          <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center">
            <Filter size={16} className="me-2" />
            Advanced
          </button>
        </div>
      </div>

      {/* Enhanced Customer Table */}
      <div className="row mb-4">
        <div className="col-12">
          <AnimatedCard className="h-100" hover={false}>
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <Users size={20} className="me-2 text-primary" />
                Customers ({filteredAndSortedCustomers.length})
              </h5>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary">
                  <i className="fas fa-download me-1"></i> Export
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={[
                  {
                    key: 'customer',
                    label: 'Customer',
                    sortable: true,
                    render: (_, customer: Customer) => (
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-primary text-white me-3 d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px', borderRadius: '50%', fontSize: '14px', fontWeight: '600' }}>
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <div className="fw-semibold">{customer.name}</div>
                          <small className="text-muted">ID: {customer.id.slice(-8)}</small>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'contact',
                    label: 'Contact',
                    render: (_, customer: Customer) => (
                      <div>
                        <div className="d-flex align-items-center mb-1">
                          <Mail size={12} className="me-2 text-muted" />
                          <small>{customer.email}</small>
                        </div>
                        {customer.phone && (
                          <div className="d-flex align-items-center">
                            <Phone size={12} className="me-2 text-muted" />
                            <small className="text-muted">{customer.phone}</small>
                          </div>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'loyalty',
                    label: 'Loyalty',
                    sortable: true,
                    render: (_, customer: Customer) => {
                      const status = getStatusBadge(customer);
                      return (
                        <div>
                          <div className="d-flex align-items-center mb-1">
                            <span className={`badge ${getTierBadgeClass(customer.tier)} me-2`}>
                              <Crown size={10} className="me-1" />
                              {customer.tier}
                            </span>
                            <span className={`badge ${status.class}`}>{status.label}</span>
                          </div>
                          <small className="text-muted">
                            <Star size={10} className="me-1" />
                            {customer.loyaltyPoints} points
                          </small>
                        </div>
                      );
                    }
                  },
                  {
                    key: 'orders',
                    label: 'Orders',
                    sortable: true,
                    render: (_, customer: Customer) => (
                      <div className="text-center">
                        <div className="fw-semibold">{customer.ordersCount || 0}</div>
                        {customer.lastOrderDate && (
                          <small className="text-muted">
                            Last: {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </small>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'totalSpent',
                    label: 'Total Spent',
                    sortable: true,
                    render: (_, customer: Customer) => (
                      <div className="fw-semibold">${parseFloat(customer.totalSpent || '0').toFixed(2)}</div>
                    )
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (_, customer: Customer) => (
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary btn-ripple"
                          onClick={() => handleViewCustomer(customer)}
                          data-testid={`button-view-customer-${customer.id}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary btn-ripple"
                          onClick={() => handleEdit(customer)}
                          data-testid={`button-edit-customer-${customer.id}`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger btn-ripple"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          data-testid={`button-delete-customer-${customer.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  }
                ]}
                data={filteredAndSortedCustomers}
                onSort={handleSort}
                loading={isLoading}
                emptyMessage="No customers found matching your criteria"
                className="modern-table"
              />
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-3">
          <AnimatedCard className="h-100" hover={false}>
            <div className="card-header">
              <h6 className="card-title mb-0">
                <Award className="me-2" size={16} />
                Loyalty Tier Distribution
              </h6>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: '300px' }}>
                <ChartContainer
                  config={{
                    bronze: { label: 'Bronze', color: '#CD7F32' },
                    silver: { label: 'Silver', color: '#C0C0C0' },
                    gold: { label: 'Gold', color: '#FFD700' },
                    platinum: { label: 'Platinum', color: '#E5E4E2' }
                  }}
                >
                  <PieChart>
                    <Pie
                      data={loyaltyDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {loyaltyDistributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-lg-4 mb-3">
          <AnimatedCard className="h-100" hover={false}>
            <div className="card-header">
              <h6 className="card-title mb-0">
                <TrendingUp className="me-2" size={16} />
                Top Customers by Spending
              </h6>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: '300px' }}>
                <ChartContainer
                  config={{
                    value: { label: 'Spending', color: 'var(--shopify-green)' }
                  }}
                >
                  <BarChart data={topCustomersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--shopify-green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </AnimatedCard>
        </div>
        
        <div className="col-lg-4 mb-3">
          <AnimatedCard className="h-100" hover={false}>
            <div className="card-header">
              <h6 className="card-title mb-0">
                <Users className="me-2" size={16} />
                Customer Growth Trend
              </h6>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: '300px' }}>
                <ChartContainer
                  config={{
                    customers: { label: 'New Customers', color: 'var(--coral-accent)' }
                  }}
                >
                  <LineChart data={customerGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="var(--coral-accent)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--coral-accent)', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Customer Profile Modal */}
      <AnimatedModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? `${selectedCustomer.name} - Customer Profile` : ''}
        size="xl"
      >
        {selectedCustomer && (
          <Tabs defaultValue="profile" className="w-100">
            <TabsList className="nav nav-tabs w-100">
              <TabsTrigger value="profile" className="nav-link">Profile</TabsTrigger>
              <TabsTrigger value="orders" className="nav-link">Orders</TabsTrigger>
              <TabsTrigger value="loyalty" className="nav-link">Loyalty</TabsTrigger>
              <TabsTrigger value="subscriptions" className="nav-link">Subscriptions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="tab-pane mt-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <p className="mb-0">{selectedCustomer.name}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <p className="mb-0">{selectedCustomer.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone</label>
                    <p className="mb-0">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Customer Since</label>
                    <p className="mb-0">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Loyalty Tier</label>
                    <p className="mb-0">
                      <span className={`badge ${getTierBadgeClass(selectedCustomer.tier)}`}>
                        <Crown size={12} className="me-1" />
                        {selectedCustomer.tier}
                      </span>
                    </p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <p className="mb-0">
                      <span className={`badge ${getStatusBadge(selectedCustomer).class}`}>
                        {getStatusBadge(selectedCustomer).label}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="tab-pane mt-3">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Points Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.length > 0 ? (
                      customerOrders.map((order: CustomerOrder) => (
                        <tr key={order.id}>
                          <td><code>{order.id.slice(-8)}</code></td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>${parseFloat(order.total).toFixed(2)}</td>
                          <td>
                            <span className={`badge ${order.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Star size={12} className="me-1" />
                            {order.pointsEarned}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          <ShoppingBag size={24} className="mb-2" />
                          <div>No orders found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="loyalty" className="tab-pane mt-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <Star size={24} className="mb-2" />
                      <h4>{selectedCustomer.loyaltyPoints}</h4>
                      <p className="mb-0">Current Points</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <Gift size={24} className="mb-2" />
                      <h4>${parseFloat(selectedCustomer.totalSpent || '0').toFixed(2)}</h4>
                      <p className="mb-0">Total Spent</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h6>Recent Transactions</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Points</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyTransactions.length > 0 ? (
                        loyaltyTransactions.slice(0, 5).map((transaction: LoyaltyTransaction) => (
                          <tr key={transaction.id}>
                            <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${transaction.type === 'earned' ? 'bg-success' : 'bg-info'}`}>
                                {transaction.type}
                              </span>
                            </td>
                            <td className={transaction.type === 'earned' ? 'text-success' : 'text-info'}>
                              {transaction.type === 'earned' ? '+' : '-'}{transaction.points}
                            </td>
                            <td>{transaction.description || 'Order purchase'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center text-muted">
                            No loyalty transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="subscriptions" className="tab-pane mt-3">
              <div className="text-center py-5">
                <CreditCard size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No subscriptions found</h6>
                <p className="text-muted small">This customer doesn't have any active or past subscriptions.</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </AnimatedModal>
    </div>
  );
};

export default Customers;
