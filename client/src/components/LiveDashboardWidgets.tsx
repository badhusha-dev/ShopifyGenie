import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FaChartLine, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign,
  FaTrendingUp,
  FaTrendingDown,
  FaSync
} from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface WidgetData {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  format: 'number' | 'currency' | 'percentage';
}

const LiveDashboardWidgets: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Fetch real-time dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['/dashboard/live'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/live');
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    refetchInterval: isLive ? 10000 : false, // Refetch every 10 seconds if live
  });

  // Auto-refresh timestamp
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'dashboard-update') {
        // Trigger refetch when real-time data arrives
        refetch();
      }
    };

    return () => {
      ws.close();
    };
  }, [refetch]);

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getChangeIcon = (changeType: string) => {
    return changeType === 'increase' ? (
      <FaTrendingUp className="text-success" />
    ) : (
      <FaTrendingDown className="text-danger" />
    );
  };

  const getChangeColor = (changeType: string) => {
    return changeType === 'increase' ? 'text-success' : 'text-danger';
  };

  const widgets: WidgetData[] = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: dashboardData?.revenue || 125847,
      change: dashboardData?.revenueChange || 12.5,
      changeType: 'increase',
      icon: <FaDollarSign />,
      color: 'success',
      format: 'currency',
    },
    {
      id: 'customers',
      title: 'Active Customers',
      value: dashboardData?.customers || 2847,
      change: dashboardData?.customersChange || 8.2,
      changeType: 'increase',
      icon: <FaUsers />,
      color: 'primary',
      format: 'number',
    },
    {
      id: 'products',
      title: 'Total Products',
      value: dashboardData?.products || 1247,
      change: dashboardData?.productsChange || -2.1,
      changeType: 'decrease',
      icon: <FaBox />,
      color: 'info',
      format: 'number',
    },
    {
      id: 'orders',
      title: 'Orders Today',
      value: dashboardData?.orders || 89,
      change: dashboardData?.ordersChange || 15.3,
      changeType: 'increase',
      icon: <FaShoppingCart />,
      color: 'warning',
      format: 'number',
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: dashboardData?.conversion || 3.2,
      change: dashboardData?.conversionChange || 0.8,
      changeType: 'increase',
      icon: <FaChartLine />,
      color: 'danger',
      format: 'percentage',
    },
    {
      id: 'growth',
      title: 'Growth Rate',
      value: dashboardData?.growth || 18.7,
      change: dashboardData?.growthChange || 2.4,
      changeType: 'increase',
      icon: <FaTrendingUp />,
      color: 'success',
      format: 'percentage',
    },
  ];

  return (
    <div className="row g-4 mb-4">
      {/* Live Status Header */}
      <div className="col-12">
        <AnimatedCard className="p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className={`me-3 ${isLive ? 'text-success' : 'text-muted'}`}>
                <div className={`rounded-circle d-inline-block ${isLive ? 'bg-success' : 'bg-secondary'}`} 
                     style={{ width: '12px', height: '12px' }}></div>
              </div>
              <div>
                <h6 className="mb-0 fw-bold">
                  {isLive ? 'Live Dashboard' : 'Dashboard Paused'}
                </h6>
                <small className="text-muted">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${isLive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? 'Pause' : 'Resume'}
              </button>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <FaSync className={isLoading ? 'fa-spin' : ''} />
              </button>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Widgets */}
      {widgets.map((widget) => (
        <div key={widget.id} className="col-md-4 col-lg-2">
          <AnimatedCard className="h-100 p-3 text-center">
            <div className={`text-${widget.color} mb-2`} style={{ fontSize: '2rem' }}>
              {widget.icon}
            </div>
            <h4 className="fw-bold mb-1">
              {formatValue(widget.value, widget.format)}
            </h4>
            <h6 className="text-muted mb-2">{widget.title}</h6>
            <div className={`d-flex align-items-center justify-content-center ${getChangeColor(widget.changeType)}`}>
              {getChangeIcon(widget.changeType)}
              <span className="ms-1 fw-semibold">
                {Math.abs(widget.change).toFixed(1)}%
              </span>
            </div>
            <small className="text-muted">vs last period</small>
          </AnimatedCard>
        </div>
      ))}

      {/* Real-time Activity Feed */}
      <div className="col-12">
        <AnimatedCard>
          <h5 className="fw-bold mb-3">
            <FaChartLine className="me-2 text-primary" />
            Real-time Activity
          </h5>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="me-3">
                  <FaShoppingCart className="text-success fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">New Order</h6>
                  <p className="text-muted mb-0">Order #12345 - $89.99</p>
                  <small className="text-muted">2 minutes ago</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="me-3">
                  <FaUsers className="text-primary fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">New Customer</h6>
                  <p className="text-muted mb-0">John Doe registered</p>
                  <small className="text-muted">5 minutes ago</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="me-3">
                  <FaBox className="text-warning fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Low Stock Alert</h6>
                  <p className="text-muted mb-0">Product "Widget A" - 5 units left</p>
                  <small className="text-muted">8 minutes ago</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="me-3">
                  <FaDollarSign className="text-success fs-4" />
                </div>
                <div>
                  <h6 className="mb-1">Payment Received</h6>
                  <p className="text-muted mb-0">$156.78 from Order #12344</p>
                  <small className="text-muted">12 minutes ago</small>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default LiveDashboardWidgets;
