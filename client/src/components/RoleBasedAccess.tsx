import React from 'react';
import { useRole } from './RoleProvider';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'staff' | 'customer';
  fallback?: React.ReactNode;
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRole,
  fallback = (
    <div className="card">
      <div className="card-body text-center py-5">
        <i className="fas fa-lock fa-3x text-muted mb-3"></i>
        <h5 className="text-muted">Access Restricted</h5>
        <p className="text-muted">
          You don't have permission to view this content. Required role: {requiredRole}
        </p>
      </div>
    </div>
  ),
}) => {
  const { hasAccess, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!hasAccess(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedAccess;