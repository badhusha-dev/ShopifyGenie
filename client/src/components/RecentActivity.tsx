import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaClock, FaShoppingCart, FaUserPlus, FaExclamationTriangle, FaCreditCard, FaDatabase } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

const RecentActivity: React.FC = () => {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/recent-activity'],
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'fas fa-shopping-cart': return <FaShoppingCart />;
      case 'fas fa-user-plus': return <FaUserPlus />;
      case 'fas fa-exclamation-triangle': return <FaExclamationTriangle />;
      case 'fas fa-credit-card': return <FaCreditCard />;
      case 'fas fa-database': return <FaDatabase />;
      default: return <FaClock />;
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'success': return 'text-success';
      case 'info': return 'text-info';
      case 'warning': return 'text-warning';
      case 'primary': return 'text-primary';
      default: return 'text-secondary';
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

  if (isLoading) {
    return (
      <AnimatedCard>
        <div className="card-header">
          <h5 className="mb-0">Recent Activity</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard>
      <div className="card-header">
        <h5 className="mb-0">Recent Activity</h5>
      </div>
      <div className="card-body">
        <div className="activity-feed">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item d-flex align-items-start mb-3">
              <div className={`activity-icon me-3 ${getColorClass(activity.color)}`}>
                {getIcon(activity.icon)}
              </div>
              <div className="activity-content flex-grow-1">
                <div className="activity-title fw-semibold text-dark">
                  {activity.title}
                </div>
                <div className="activity-description text-muted small">
                  {activity.description}
                </div>
                <div className="activity-time text-muted small">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default RecentActivity;
