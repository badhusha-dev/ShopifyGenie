
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import TopNav from '../components/TopNav';

interface Permission {
  id: string;
  name: string;
  category: string;
  operation: string;
  description: string;
}

interface RolePermissions {
  [role: string]: Record<string, boolean>;
}

const RolePermissionManagement: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      const response = await fetch('/api/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch permissions');
      return response.json();
    },
    enabled: !!token
  });

  const roles = ['admin', 'staff', 'customer'];

  // Fetch permissions for each role
  const { isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['/api/role-permissions', 'all'],
    queryFn: async () => {
      const responses = await Promise.all(
        roles.map(role =>
          fetch(`/api/role-permissions/${role}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json())
        )
      );
      
      const rolePermsData: RolePermissions = {};
      responses.forEach((data, index) => {
        rolePermsData[roles[index]] = data.permissions || {};
      });
      
      setRolePermissions(rolePermsData);
      return rolePermsData;
    },
    enabled: !!token && permissions.length > 0
  });

  const updateRolePermissionsMutation = useMutation({
    mutationFn: async ({ role, permissions }: { role: string; permissions: Record<string, boolean> }) => {
      const response = await fetch(`/api/role-permissions/${role}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permissions');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
      setHasChanges(false);
    }
  });

  const handlePermissionChange = (role: string, permission: string, granted: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: granted
      }
    }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    for (const role of roles) {
      if (rolePermissions[role]) {
        await updateRolePermissionsMutation.mutateAsync({
          role,
          permissions: rolePermissions[role]
        });
      }
    }
  };

  const resetChanges = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/role-permissions'] });
    setHasChanges(false);
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc: Record<string, Permission[]>, permission: Permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary';
      case 'staff': return 'bg-success';
      case 'customer': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (permissionsLoading || rolePermissionsLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav 
        title="Role & Permission Management" 
        subtitle="Configure role-based access permissions"
      />
      
      <div className="content-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>Permission Matrix</h4>
            <p className="text-muted mb-0">
              Configure which roles have access to specific operations
            </p>
          </div>
          {hasChanges && (
            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                onClick={resetChanges}
                disabled={updateRolePermissionsMutation.isPending}
              >
                <i className="fas fa-undo me-2"></i>
                Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={saveChanges}
                disabled={updateRolePermissionsMutation.isPending}
              >
                {updateRolePermissionsMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {hasChanges && (
          <div className="alert alert-warning mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            You have unsaved changes. Click "Save Changes" to apply them.
          </div>
        )}

        <div className="card">
          <div className="card-body">
            {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <div key={category} className="mb-4">
                <h5 className="text-capitalize mb-3">
                  <i className={`fas fa-${
                    category === 'inventory' ? 'boxes' :
                    category === 'orders' ? 'shopping-cart' :
                    category === 'customers' ? 'users' :
                    category === 'reports' ? 'chart-bar' :
                    category === 'users' ? 'user-cog' :
                    category === 'vendors' ? 'handshake' :
                    category === 'subscriptions' ? 'sync' : 'cog'
                  } me-2`}></i>
                  {category}
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Permission</th>
                        {roles.map(role => (
                          <th key={role} className="text-center" style={{ width: '20%' }}>
                            <span className={`badge ${getRoleBadgeClass(role)}`}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPermissions.map((permission: Permission) => (
                        <tr key={permission.name}>
                          <td>
                            <div>
                              <strong>{permission.operation.charAt(0).toUpperCase() + permission.operation.slice(1)}</strong>
                              <div className="text-muted small">{permission.description}</div>
                            </div>
                          </td>
                          {roles.map(role => (
                            <td key={role} className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={rolePermissions[role]?.[permission.name] || false}
                                  onChange={(e) => handlePermissionChange(role, permission.name, e.target.checked)}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-info-circle me-2"></i>
              Permission Guidelines
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <h6 className="text-primary">Admin</h6>
                <p className="small text-muted">
                  Typically has access to most business operations but cannot manage user roles.
                </p>
              </div>
              <div className="col-md-4">
                <h6 className="text-success">Staff</h6>
                <p className="small text-muted">
                  Limited to day-to-day operations like viewing and editing inventory, orders, and customers.
                </p>
              </div>
              <div className="col-md-4">
                <h6 className="text-secondary">Customer</h6>
                <p className="small text-muted">
                  Minimal access, typically only to their own customer portal and basic dashboard.
                </p>
              </div>
            </div>
            <div className="alert alert-info mt-3 mb-0">
              <strong>Note:</strong> Super Admin has all permissions automatically and cannot be modified.
              Changes take effect immediately after saving.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RolePermissionManagement;
