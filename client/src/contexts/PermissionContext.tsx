
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

interface PermissionContextType {
  permissions: Record<string, boolean>;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserPermissions = async () => {
    if (!token || !user) {
      setPermissions({});
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user-permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || {});
      } else {
        setPermissions({});
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    // Super admin has all permissions
    if (user?.role === 'superadmin') {
      return true;
    }
    
    return permissions[permission] === true;
  };

  const refreshPermissions = async () => {
    await fetchUserPermissions();
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user, token]);

  const value: PermissionContextType = {
    permissions,
    hasPermission,
    isLoading,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
