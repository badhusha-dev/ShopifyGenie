import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Settings, 
  Filter,
  Archive,
  Star,
  Clock,
  User,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  archived: boolean;
  category: string;
  action?: {
    label: string;
    url: string;
  };
  metadata?: any;
}

interface AdvancedNotificationSystemProps {
  className?: string;
}

const AdvancedNotificationSystem: React.FC<AdvancedNotificationSystemProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      priority: 'critical',
      title: 'Payment Failed',
      message: 'Credit card payment for Order #12345 failed. Customer needs immediate attention.',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      starred: false,
      archived: false,
      category: 'payments',
      action: { label: 'View Order', url: '/orders/12345' }
    },
    {
      id: '2',
      type: 'warning',
      priority: 'high',
      title: 'Low Stock Alert',
      message: '5 products are running critically low on inventory and need immediate restocking.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      starred: true,
      archived: false,
      category: 'inventory',
      action: { label: 'View Products', url: '/inventory' }
    },
    {
      id: '3',
      type: 'success',
      priority: 'medium',
      title: 'New Customer Registration',
      message: 'Sarah Johnson registered and made her first purchase worth $89.99.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: true,
      starred: false,
      archived: false,
      category: 'customers',
      action: { label: 'View Profile', url: '/customers/sarah-johnson' }
    },
    {
      id: '4',
      type: 'info',
      priority: 'low',
      title: 'Weekly Report Ready',
      message: 'Your weekly business performance report is now available for download.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      starred: false,
      archived: false,
      category: 'reports',
      action: { label: 'Download Report', url: '/reports/weekly' }
    },
    {
      id: '5',
      type: 'error',
      priority: 'high',
      title: 'API Integration Error',
      message: 'Shopify API connection failed. Some data may not be syncing properly.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      read: false,
      starred: true,
      archived: false,
      category: 'integrations',
      action: { label: 'Check Connection', url: '/integrations' }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read && !n.archived).length);
  }, [notifications]);

  const categories = [
    { value: 'all', label: 'All Categories', icon: Bell },
    { value: 'payments', label: 'Payments', icon: DollarSign },
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'customers', label: 'Customers', icon: User },
    { value: 'reports', label: 'Reports', icon: TrendingUp },
    { value: 'integrations', label: 'Integrations', icon: Settings }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'urgent': return BellRing;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const toggleStar = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n)
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, archived: true, read: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read && !notification.archived) ||
      (filter === 'starred' && notification.starred && !notification.archived) ||
      (filter === 'archived' && notification.archived);
    
    const matchesCategory = 
      categoryFilter === 'all' || notification.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`advanced-notification-system ${className}`}>
      <div className="row">
        {/* Notification Panel */}
        <div className="col-lg-8">
          <div className="modern-card p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <Bell size={24} className="text-primary me-3" />
                <div>
                  <h5 className="fw-bold mb-0">Notifications</h5>
                  <p className="text-muted small mb-0">
                    {unreadCount} unread notifications
                  </p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Eye size={16} className="me-1" />
                  Mark All Read
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="btn-group w-100" role="group">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'starred', label: 'Starred' },
                    { value: 'archived', label: 'Archived' }
                  ].map((f) => (
                    <button
                      key={f.value}
                      className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter(f.value as any)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select form-select-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-5">
                  <Bell size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No notifications found</h6>
                  <p className="text-muted small">
                    {filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const priorityColor = getPriorityColor(notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''} mb-3`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="d-flex align-items-start">
                        <div className={`notification-icon me-3 bg-${priorityColor}-subtle`}>
                          <IconComponent size={20} className={`text-${priorityColor}`} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="d-flex align-items-center">
                                <h6 className="fw-bold mb-1 me-2">{notification.title}</h6>
                                <span className={`badge bg-${priorityColor}-subtle text-${priorityColor} small`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="text-muted small mb-2">{notification.message}</p>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(notification.id);
                                }}
                              >
                                <Star size={14} className={notification.starred ? 'text-warning fill-warning' : ''} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNotification(notification.id);
                                }}
                              >
                                <Archive size={14} />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                              <span className="text-muted small">
                                <Clock size={12} className="me-1" />
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              <span className="badge bg-secondary-subtle text-secondary">
                                {notification.category}
                              </span>
                            </div>
                            {notification.action && (
                              <button className="btn btn-sm btn-primary">
                                {notification.action.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="col-lg-4">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center mb-3">
              <Settings size={20} className="text-primary me-2" />
              <h6 className="fw-bold mb-0">Notification Settings</h6>
            </div>

            <div className="settings-section mb-4">
              <h6 className="fw-semibold mb-3">Categories</h6>
              {categories.slice(1).map(category => (
                <div key={category.value} className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`category-${category.value}`}
                    defaultChecked
                  />
                  <label className="form-check-label d-flex align-items-center" htmlFor={`category-${category.value}`}>
                    <category.icon size={16} className="me-2 text-muted" />
                    {category.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="settings-section mb-4">
              <h6 className="fw-semibold mb-3">Priority Levels</h6>
              {[
                { value: 'critical', label: 'Critical', color: 'danger' },
                { value: 'high', label: 'High', color: 'warning' },
                { value: 'medium', label: 'Medium', color: 'info' },
                { value: 'low', label: 'Low', color: 'secondary' }
              ].map(priority => (
                <div key={priority.value} className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`priority-${priority.value}`}
                    defaultChecked
                  />
                  <label className="form-check-label d-flex align-items-center" htmlFor={`priority-${priority.value}`}>
                    <span className={`badge bg-${priority.color}-subtle text-${priority.color} me-2`}>
                      {priority.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <div className="settings-section">
              <h6 className="fw-semibold mb-3">Delivery Methods</h6>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="browser-notifications"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="browser-notifications">
                  Browser Notifications
                </label>
              </div>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="email-notifications"
                  defaultChecked
                />
                <label className="form-check-label" htmlFor="email-notifications">
                  Email Notifications
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="sms-notifications"
                />
                <label className="form-check-label" htmlFor="sms-notifications">
                  SMS Notifications
                </label>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="modern-card p-4 mt-3">
            <h6 className="fw-bold mb-3">Notification Stats</h6>
            <div className="stats-grid">
              <div className="stat-item text-center">
                <div className="stat-value fw-bold text-primary">{notifications.length}</div>
                <div className="stat-label text-muted small">Total</div>
              </div>
              <div className="stat-item text-center">
                <div className="stat-value fw-bold text-warning">{unreadCount}</div>
                <div className="stat-label text-muted small">Unread</div>
              </div>
              <div className="stat-item text-center">
                <div className="stat-value fw-bold text-info">
                  {notifications.filter(n => n.starred && !n.archived).length}
                </div>
                <div className="stat-label text-muted small">Starred</div>
              </div>
              <div className="stat-item text-center">
                <div className="stat-value fw-bold text-secondary">
                  {notifications.filter(n => n.archived).length}
                </div>
                <div className="stat-label text-muted small">Archived</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedNotificationSystem;
