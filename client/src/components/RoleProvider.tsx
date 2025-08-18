import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface RoleContextType {
  userRole: 'admin' | 'staff' | 'customer' | null;
  userId: string;
  setUserId: (id: string) => void;
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
  const [userId, setUserId] = useState('admin'); // Mock user ID - in real app would come from auth

  const { data: roleData, isLoading } = useQuery({
    queryKey: ['/api/user/role', userId],
    enabled: !!userId,
  });

  const hasAccess = (requiredRole: 'admin' | 'staff' | 'customer') => {
    const userRole = roleData?.role;
    if (!userRole) return false;

    const hierarchy = { admin: 3, staff: 2, customer: 1 };
    return hierarchy[userRole] >= hierarchy[requiredRole];
  };

  const value: RoleContextType = {
    userRole: roleData?.role || null,
    userId,
    setUserId,
    hasAccess,
    isLoading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};