import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaBell, FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';
import { useWebSocket } from '../hooks/useWebSocket';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/notifications'],
  });

  // WebSocket for real-time notifications
  const { isConnected } = useWebSocket({
    onNotification: (notification) => {
      setRealTimeNotifications(prev => [notification, ...prev]);
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-success" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-subtle text-success';
      case 'warning': return 'bg-warning-subtle text-warning';
      case 'error': return 'bg-danger-subtle text-danger';
      default: return 'bg-info-subtle text-info';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId]);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = allNotifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  // Combine API notifications with real-time notifications
  const allNotifications = [...realTimeNotifications, ...notifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  if (!isOpen) {
    return (
      <div className="notification-toggle">
        <button
          className="btn btn-outline-primary position-relative"
          onClick={() => setIsOpen(true)}
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount}
            </span>
          )}
          {isConnected && (
            <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-success" style={{ fontSize: '8px' }}>
              ●
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="notification-center" style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <AnimatedCard className="h-100 d-flex flex-column">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaBell className="text-primary me-2" />
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </div>
          <div className="d-flex gap-2">
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={handleMarkAllAsRead}
                disabled={markAsReadMutation.isPending}
              >
                <FaCheck size={12} />
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="card-body flex-grow-1 overflow-auto">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : allNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaBell size={48} className="mb-3 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="notifications-list">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                >
                  <div className="d-flex align-items-start">
                    <div className="notification-icon me-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-1 text-dark">{notification.title}</h6>
                        {!notification.read && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <FaCheck size={10} />
                          </button>
                        )}
                      </div>
                      <p className="text-muted small mb-2">{notification.message}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{formatTimeAgo(notification.timestamp)}</small>
                        <span className={`badge ${getNotificationBadge(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      {notification.actionUrl && (
                        <div className="mt-2">
                          <a
                            href={notification.actionUrl}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Details
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>
    </div>
  );
};

export default NotificationCenter;
