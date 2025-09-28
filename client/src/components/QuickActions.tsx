import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FaPlus, 
  FaBox, 
  FaUsers, 
  FaShoppingCart, 
  FaFileExport, 
  FaCog,
  FaChartLine,
  FaBell,
  FaCloud,
  FaSync
} from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  loading?: boolean;
}

const QuickActions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/inventory'] });
      alert('Product created successfully!');
    },
    onError: () => {
      alert('Failed to create product');
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error('Failed to create customer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/customers'] });
      alert('Customer created successfully!');
    },
    onError: () => {
      alert('Failed to create customer');
    },
  });

  // Export data mutation
  const exportDataMutation = useMutation({
    mutationFn: async (exportType: string) => {
      const response = await fetch(`/api/export/${exportType}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to export data');
      return response.blob();
    },
    onSuccess: (blob, exportType) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}-export.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert('Data exported successfully!');
    },
    onError: () => {
      alert('Failed to export data');
    },
  });

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Quick Backup', type: 'full' }),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/backups'] });
      alert('Backup created successfully!');
    },
    onError: () => {
      alert('Failed to create backup');
    },
  });

  // Sync data mutation
  const syncDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync data');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      alert('Data synced successfully!');
    },
    onError: () => {
      alert('Failed to sync data');
    },
  });

  const quickActions: QuickAction[] = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'Create a new product',
      icon: <FaBox />,
      color: 'primary',
      action: () => {
        const productData = {
          name: 'New Product',
          description: 'Product description',
          price: 0,
          stock: 0,
          category: 'General'
        };
        createProductMutation.mutate(productData);
      },
      loading: createProductMutation.isPending,
    },
    {
      id: 'add-customer',
      title: 'Add Customer',
      description: 'Create a new customer',
      icon: <FaUsers />,
      color: 'success',
      action: () => {
        const customerData = {
          name: 'New Customer',
          email: 'customer@example.com',
          phone: '',
          address: ''
        };
        createCustomerMutation.mutate(customerData);
      },
      loading: createCustomerMutation.isPending,
    },
    {
      id: 'create-order',
      title: 'New Order',
      description: 'Create a new order',
      icon: <FaShoppingCart />,
      color: 'warning',
      action: () => {
        window.location.href = '/orders/new';
      },
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export business data',
      icon: <FaFileExport />,
      color: 'info',
      action: () => {
        exportDataMutation.mutate('sales');
      },
      loading: exportDataMutation.isPending,
    },
    {
      id: 'system-settings',
      title: 'Settings',
      description: 'Configure system',
      icon: <FaCog />,
      color: 'secondary',
      action: () => {
        window.location.href = '/settings';
      },
    },
    {
      id: 'view-reports',
      title: 'Reports',
      description: 'View analytics',
      icon: <FaChartLine />,
      color: 'dark',
      action: () => {
        window.location.href = '/reports';
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View notifications',
      icon: <FaBell />,
      color: 'danger',
      action: () => {
        window.location.href = '/notifications';
      },
    },
    {
      id: 'create-backup',
      title: 'Backup',
      description: 'Create system backup',
      icon: <FaCloud />,
      color: 'primary',
      action: () => {
        createBackupMutation.mutate();
      },
      loading: createBackupMutation.isPending,
    },
    {
      id: 'sync-data',
      title: 'Sync Data',
      description: 'Sync with external systems',
      icon: <FaSync />,
      color: 'success',
      action: () => {
        syncDataMutation.mutate();
      },
      loading: syncDataMutation.isPending,
    },
  ];

  const visibleActions = isExpanded ? quickActions : quickActions.slice(0, 6);

  return (
    <AnimatedCard className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">
          <FaPlus className="me-2 text-primary" />
          Quick Actions
        </h5>
        {quickActions.length > 6 && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show All (${quickActions.length})`}
          </button>
        )}
      </div>

      <div className="row g-3">
        {visibleActions.map((action) => (
          <div key={action.id} className="col-md-4 col-lg-3">
            <button
              className={`btn btn-outline-${action.color} w-100 h-100 p-3 d-flex flex-column align-items-center justify-content-center`}
              onClick={action.action}
              disabled={action.loading}
              style={{ minHeight: '120px' }}
            >
              {action.loading ? (
                <div className="spinner-border spinner-border-sm mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div className={`text-${action.color} mb-2`} style={{ fontSize: '1.5rem' }}>
                  {action.icon}
                </div>
              )}
              <div className="fw-semibold mb-1">{action.title}</div>
              <small className="text-muted text-center">{action.description}</small>
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mt-4 pt-3 border-top">
        <div className="col-md-3">
          <div className="text-center">
            <div className="h4 text-primary mb-1">24</div>
            <small className="text-muted">Products Added</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <div className="h4 text-success mb-1">156</div>
            <small className="text-muted">Customers</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <div className="h4 text-warning mb-1">89</div>
            <small className="text-muted">Orders Today</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="text-center">
            <div className="h4 text-info mb-1">12</div>
            <small className="text-muted">Exports</small>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

export default QuickActions;
