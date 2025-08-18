import React, { createContext, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RoleContextType {
  userRole: 'admin' | 'staff' | 'customer' | null;
  userId: string;
  hasAccess: (requiredRole: 'admin' | 'staff' | 'customer') => boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: React.ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  const hasAccess = (requiredRole: 'admin' | 'staff' | 'customer') => {
    const userRole = user?.role;
    if (!userRole) return false;

    const hierarchy = { admin: 3, staff: 2, customer: 1 };
    return hierarchy[userRole] >= hierarchy[requiredRole];
  };

  const value: RoleContextType = {
    userRole: user?.role || null,
    userId: user?.id || '',
    hasAccess,
    isLoading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};