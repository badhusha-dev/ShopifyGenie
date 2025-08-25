
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { KpiCard } from '../components/ui/kpi-card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
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
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const { toast } = useToast();
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
    queryFn: async (): Promise<Refund[]> => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          orderId: 'ORD-001',
          amount: 99.99,
          reason: 'Defective product',
          status: 'pending',
          requestDate: '2024-01-15',
          customerName: 'John Doe'
        },
        {
          id: '2',
          orderId: 'ORD-002',
          amount: 149.99,
          reason: 'Changed mind',
          status: 'approved',
          requestDate: '2024-01-14',
          customerName: 'Jane Smith'
        }
      ];
    }
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: async (): Promise<Wallet[]> => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          customerName: 'John Doe',
          balance: 25.50,
          currency: 'USD',
          lastActivity: '2024-01-15'
        },
        {
          id: '2',
          customerName: 'Jane Smith',
          balance: 150.00,
          currency: 'USD',
          lastActivity: '2024-01-14'
        }
      ];
    }
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts'],
    queryFn: async (): Promise<Payout[]> => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          amount: 5000,
          vendor: 'TechSupply Co',
          dueDate: '2024-01-20',
          status: 'pending',
          description: 'Electronics inventory'
        },
        {
          id: '2',
          amount: 2500,
          vendor: 'Fashion Hub',
          dueDate: '2024-01-18',
          status: 'overdue',
          description: 'Clothing inventory'
        }
      ];
    }
  });

  const updateRefundMutation = useMutation({
    mutationFn: async ({ refundId, status }: { refundId: string; status: string }) => {
      // Mock API call
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({
        title: "Success",
        description: "Refund status updated successfully",
      });
    }
  });

  const adjustWalletMutation = useMutation({
    mutationFn: async ({ walletId, amount, reason }: { walletId: string; amount: number; reason: string }) => {
      // Mock API call
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setIsWalletDialogOpen(false);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      toast({
        title: "Success",
        description: "Wallet balance adjusted successfully",
      });
    }
  });

  const markPayoutPaidMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      // Mock API call
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: "Success",
        description: "Payout marked as paid",
      });
    }
  });

  const handleWalletAdjustment = () => {
    if (!selectedWallet || !adjustmentAmount) return;
    
    adjustWalletMutation.mutate({
      walletId: selectedWallet.id,
      amount: parseFloat(adjustmentAmount),
      reason: adjustmentReason
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Monitor your financial performance and manage transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={`$${financeMetrics.totalRevenue.toLocaleString()}`}
          change={`+${financeMetrics.revenueGrowth}%`}
          changeType="positive"
          icon={DollarSign}
          gradient="coral"
        />
        <KpiCard
          title="Cost of Goods Sold"
          value={`$${financeMetrics.totalCOGS.toLocaleString()}`}
          icon={TrendingDown}
          gradient="blue"
        />
        <KpiCard
          title="Gross Margin"
          value={`${financeMetrics.grossMargin}%`}
          change={`${financeMetrics.marginGrowth}%`}
          changeType="negative"
          icon={TrendingUp}
          gradient="emerald"
        />
        <KpiCard
          title="Refund Rate"
          value={`${financeMetrics.refundRate}%`}
          icon={RefreshCw}
          gradient="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Revenue vs COGS</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueVsCOGSData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#FF6B6B" strokeWidth={2} />
                <Line type="monotone" dataKey="cogs" stroke="#3498DB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Category Margins</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryMarginData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
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
          </CardContent>
        </Card>
      </div>

      {/* Finance Tables */}
      <Tabs defaultValue="refunds" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="wallets">Customer Wallets</TabsTrigger>
          <TabsTrigger value="payouts">Vendor Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="refunds">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Refund Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refunds.map((refund) => (
                    <TableRow key={refund.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{refund.orderId}</TableCell>
                      <TableCell>{refund.customerName}</TableCell>
                      <TableCell>${refund.amount}</TableCell>
                      <TableCell>{refund.reason}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(refund.status)}>
                          {getStatusIcon(refund.status)}
                          <span className="ml-1">{refund.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {refund.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateRefundMutation.mutate({ refundId: refund.id, status: 'approved' })}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateRefundMutation.mutate({ refundId: refund.id, status: 'rejected' })}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Customer Wallets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{wallet.customerName}</TableCell>
                      <TableCell>${wallet.balance.toFixed(2)}</TableCell>
                      <TableCell>{wallet.currency}</TableCell>
                      <TableCell>{new Date(wallet.lastActivity).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedWallet(wallet)}
                            >
                              Adjust
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adjust Wallet Balance</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Customer: {selectedWallet?.customerName}</Label>
                                <p className="text-sm text-gray-500">Current Balance: ${selectedWallet?.balance.toFixed(2)}</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="amount">Adjustment Amount</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  step="0.01"
                                  value={adjustmentAmount}
                                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                                  placeholder="Enter amount (positive to add, negative to subtract)"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Input
                                  id="reason"
                                  value={adjustmentReason}
                                  onChange={(e) => setAdjustmentReason(e.target.value)}
                                  placeholder="Reason for adjustment"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleWalletAdjustment} className="bg-coral-600 hover:bg-coral-700">
                                  Apply Adjustment
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Vendor Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{payout.vendor}</TableCell>
                      <TableCell>${payout.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(payout.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{payout.description}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1">{payout.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payout.status !== 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markPayoutPaidMutation.mutate(payout.id)}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
