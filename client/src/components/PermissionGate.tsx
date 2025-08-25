
import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import { useAuth } from '../contexts/AuthContext';

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
  requireAll = false,
}) => {
  const { hasPermission, isLoading } = usePermissions();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasRequiredPermission = permission ? hasPermission(permission) : true;
  const hasRequiredRole = role ? 
    (Array.isArray(role) ? role.includes(user?.role || '') : user?.role === role) : true;

  const hasAccess = requireAll ? 
    (hasRequiredPermission && hasRequiredRole) : 
    (hasRequiredPermission || hasRequiredRole);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;

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
