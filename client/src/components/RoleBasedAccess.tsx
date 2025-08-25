import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredRole: 'superadmin' | 'admin' | 'staff' | 'customer';
  fallback?: React.ReactNode;
}

const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRole,
  fallback = (
    <div className="bg-white rounded-xl p-8 text-center shadow-sm">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
      <p className="text-gray-600">
        You don't have permission to view this content. Required role: {requiredRole}
      </p>
    </div>
  ),
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleHierarchy = {
    'customer': 1,
    'staff': 2,
    'admin': 3,
    'superadmin': 4
  };

  const userRoleLevel = roleHierarchy[user?.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedAccess;