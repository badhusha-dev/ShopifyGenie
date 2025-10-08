import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SalesForm from './components/SalesForm';
import SalesDashboardCards from './components/SalesDashboardCards';
import SalesTable from './components/SalesTable';
import SalesChart from './components/SalesChart';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 10000, // Auto-refresh every 10 seconds
      refetchOnWindowFocus: true
    }
  }
});

function Dashboard() {
  const { data: salesData, refetch: refetchSales } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const response = await axios.get('/api/sales?limit=20');
      return response.data;
    }
  });

  const { data: summaryData } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const response = await axios.get('/api/sales/summary');
      return response.data;
    }
  });

  const { data: todayData } = useQuery({
    queryKey: ['today'],
    queryFn: async () => {
      const response = await axios.get('/api/sales/today');
      return response.data;
    }
  });

  const { data: chartData } = useQuery({
    queryKey: ['chart'],
    queryFn: async () => {
      const response = await axios.get('/api/sales/chart');
      return response.data;
    }
  });

  const handleSaleCreated = () => {
    queryClient.invalidateQueries(['sales']);
    queryClient.invalidateQueries(['summary']);
    queryClient.invalidateQueries(['today']);
    queryClient.invalidateQueries(['chart']);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Service Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sales transactions and track revenue</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Dashboard Cards */}
          <SalesDashboardCards
            summary={summaryData?.data}
            todaySales={todayData?.data}
          />

          {/* Form and Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SalesForm onSaleCreated={handleSaleCreated} />
            </div>
            <div className="lg:col-span-2">
              <SalesChart data={chartData?.data} />
            </div>
          </div>

          {/* Sales Table */}
          <SalesTable sales={salesData?.data} />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Sales Service v1.0.0 | Auto-refreshes every 10 seconds
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
