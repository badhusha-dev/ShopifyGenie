
import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import { useRole } from './RoleProvider';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  role?: string | string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires both role and permission
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  fallback = null,
  requireAll = false
}) => {
  const { hasPermission, isLoading } = usePermissions();
  const { userRole } = useRole();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-3">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  let hasRoleAccess = true;
  let hasPermissionAccess = true;

  // Check role access
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    hasRoleAccess = roles.includes(userRole || '');
  }

  // Check permission access
  if (permission) {
    hasPermissionAccess = hasPermission(permission);
  }

  // Determine final access
  let hasAccess = true;
  if (requireAll) {
    // Both role and permission must be satisfied
    hasAccess = hasRoleAccess && hasPermissionAccess;
  } else {
    // Either role OR permission can grant access
    if (role && permission) {
      hasAccess = hasRoleAccess || hasPermissionAccess;
    } else if (role) {
      hasAccess = hasRoleAccess;
    } else if (permission) {
      hasAccess = hasPermissionAccess;
    }
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
