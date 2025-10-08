import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import CustomerForm from './components/CustomerForm';
import CustomerTable from './components/CustomerTable';
import CustomerSummaryCards from './components/CustomerSummaryCards';
import LoyaltyChart from './components/LoyaltyChart';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 10000, // Auto-refresh every 10 seconds
      refetchOnWindowFocus: true
    }
  }
});

function Dashboard() {
  // Fetch customers
  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await axios.get('/api/customers');
      return response.data;
    }
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await axios.get('/api/customers/analytics');
      return response.data;
    }
  });

  const handleCustomerAdded = () => {
    refetchCustomers();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Customer Service Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage customers and loyalty programs</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <CustomerSummaryCards 
          analytics={analyticsData?.data} 
          isLoading={analyticsLoading} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Customer Form */}
          <div className="lg:col-span-1">
            <CustomerForm onCustomerAdded={handleCustomerAdded} />
          </div>

          {/* Loyalty Chart */}
          <div className="lg:col-span-2">
            <LoyaltyChart 
              analytics={analyticsData?.data} 
              isLoading={analyticsLoading} 
            />
          </div>
        </div>

        {/* Customer Table */}
        <CustomerTable 
          customers={customersData?.data} 
          isLoading={customersLoading} 
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Customer Service Microservice - Auto-refresh every 10 seconds
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
