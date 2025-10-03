import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaTrash } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

const RealTimeNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0
  });

  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: fetchedNotifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notification stats
  const { data: fetchedStats } = useQuery<NotificationStats>({
    queryKey: ['/notification-stats'],
    queryFn: async () => {
      const response = await fetch('/api/notifications/stats');
      if (!response.ok) throw new Error('Failed to fetch notification stats');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notification-stats'] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notification-stats'] });
    },
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notification-stats'] });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/clear-all', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear all notifications');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notification-stats'] });
    },
  });

  useEffect(() => {
    setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  useEffect(() => {
    if (fetchedStats) {
      setStats(fetchedStats);
    }
  }, [fetchedStats]);

  // WebSocket connection for real-time notifications (temporarily disabled)
  useEffect(() => {
    // Disabled to prevent auth spam
    return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:5000/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        // Add new notification to the list
        setNotifications(prev => [data.notification, ...prev]);
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          unread: prev.unread + 1,
          today: prev.today + 1
        }));
      }
    };

    ws.onerror = () => {
      console.log('WebSocket connection failed for notifications');
    };

    return () => {
      ws.close();
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheck className="text-success" />;
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />;
      case 'error':
        return <FaTimes className="text-danger" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-info" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'error':
        return 'bg-danger';
      case 'info':
      default:
        return 'bg-info';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="position-relative">
      {/* Notification Bell */}
      <button
        className="btn btn-outline-primary position-relative"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderRadius: '50%', width: '40px', height: '40px' }}
      >
        <FaBell />
        {stats.unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="position-absolute top-100 end-0 mt-2 bg-white border rounded shadow-lg" 
             style={{ width: '400px', maxHeight: '500px', zIndex: 1050 }}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            <div className="d-flex gap-2">
              {stats.unread > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => clearAllMutation.mutate()}
                disabled={clearAllMutation.isPending}
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 border-bottom bg-light">
            <div className="row g-2 text-center">
              <div className="col-3">
                <div className="fw-bold text-primary">{stats.total}</div>
                <small className="text-muted">Total</small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-warning">{stats.unread}</div>
                <small className="text-muted">Unread</small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-info">{stats.today}</div>
                <small className="text-muted">Today</small>
              </div>
              <div className="col-3">
                <div className="fw-bold text-success">{stats.thisWeek}</div>
                <small className="text-muted">This Week</small>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-auto" style={{ maxHeight: '300px' }}>
            {isLoading ? (
              <div className="p-3 text-center">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-3 text-center text-muted">
                <FaBell className="fs-1 mb-2 opacity-50" />
                <p className="mb-0">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 fw-semibold">{notification.title}</h6>
                        <div className="d-flex gap-1">
                          {!notification.read && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              title="Mark as read"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <p className="mb-2 text-muted small">{notification.message}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{formatTimestamp(notification.timestamp)}</small>
                        <span className={`badge ${getNotificationBadge(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      {notification.action && (
                        <div className="mt-2">
                          <a
                            href={notification.action.url}
                            className="btn btn-sm btn-outline-primary"
                          >
                            {notification.action.label}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-top text-center">
            <a href="/notifications" className="btn btn-sm btn-outline-primary">
              View All Notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;
