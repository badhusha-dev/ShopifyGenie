import { useQuery } from '@tanstack/react-query';
import { useRole } from './RoleProvider';
import { useState } from 'react';

const AlertSystem = () => {
  const { userRole } = useRole();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const { data: alerts } = useQuery({
    queryKey: ['/api/alerts', userRole],
    enabled: !!userRole,
  });

  const visibleAlerts = alerts?.filter((alert: any) => 
    !dismissedAlerts.includes(alert.message)
  ) || [];

  const dismissAlert = (message: string) => {
    setDismissedAlerts(prev => [...prev, message]);
  };

  if (!visibleAlerts.length) return null;

  return (
    <div className="alert-system mb-3">
      {visibleAlerts.map((alert: any, index: number) => (
        <div key={index} className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center`}>
          <i className={`fas fa-${
            alert.type === 'warning' ? 'exclamation-triangle' :
            alert.type === 'info' ? 'info-circle' :
            alert.type === 'success' ? 'check-circle' : 'times-circle'
          } me-2`}></i>
          <div className="flex-grow-1">
            <strong>{alert.message}</strong>
            {alert.action && (
              <div className="mt-1">
                <button className="btn btn-sm btn-outline-secondary">
                  {alert.action}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => dismissAlert(alert.message)}
          ></button>
        </div>
      ))}
    </div>
  );
};

export default AlertSystem;