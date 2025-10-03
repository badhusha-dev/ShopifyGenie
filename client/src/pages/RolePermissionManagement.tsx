import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { usePermissions } from '../contexts/PermissionContext';

interface Permission {
  id: string;
  name: string;
  category: string;
  operation: string;
  description: string;
}

interface RolePermissions {
  [key: string]: boolean;
}

const RolePermissionManagement: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Check if user has permission to view this screen
  if (user?.role !== 'superadmin') {
    return (
      <div className="container-fluid p-4">
        <div className="card">
          <div className="card-body text-center p-5">
            <i className="fas fa-shield-alt fa-4x text-muted mb-4"></i>
            <h2 className="h3 mb-3">Access Denied</h2>
            <p className="text-muted">Only Super Administrators can access the Role & Permission Management screen.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setErrorMessage('Failed to fetch permissions. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (role: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/role-permissions/${role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role permissions');
      }

      const data = await response.json();
      setRolePermissions(data.permissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setErrorMessage('Failed to fetch role permissions. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setRolePermissions(prev => ({
      ...prev,
      [permissionName]: checked
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/role-permissions/${selectedRole}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ permissions: rolePermissions }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role permissions');
      }

      setSuccessMessage(`Permissions for ${selectedRole} role updated successfully.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error updating role permissions:', error);
      setErrorMessage('Failed to update role permissions. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-warning text-dark';
      case 'admin': return 'bg-primary';
      case 'staff': return 'bg-success';
      case 'customer': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const operations = ['view', 'create', 'edit', 'delete', 'export'];

  return (
    <div className="container-fluid p-4">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h2 fw-bold mb-2">Role & Permission Management</h1>
        <p className="text-muted">
          Manage permissions for different user roles. Super Admin permissions cannot be modified.
        </p>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                <i className="fas fa-users me-2"></i>
                Role Selection
              </h5>
              <p className="card-text text-muted mb-0">
                Select a role to view and modify its permissions
              </p>
            </div>
            <span className={`badge ${getRoleBadgeClass(selectedRole)}`}>
              {selectedRole.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <label htmlFor="role-select" className="form-label">Role:</label>
            </div>
            <div className="col-auto">
              <select 
                id="role-select"
                className="form-select" 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ width: '200px' }}
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body text-center p-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0">Loading permissions...</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-1">
              <i className="fas fa-shield-alt me-2"></i>
              Permission Matrix
            </h5>
            <p className="card-text text-muted mb-0">
              Check/uncheck permissions for the selected role
            </p>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="fw-semibold">Module</th>
                    {operations.map(operation => (
                      <th key={operation} scope="col" className="text-center fw-semibold text-capitalize">
                        {operation}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <tr key={category}>
                      <td className="fw-medium text-capitalize">
                        {category}
                      </td>
                      {operations.map(operation => {
                        const permission = categoryPermissions.find(p => p.operation === operation);
                        const permissionName = permission?.name;
                        const isChecked = permissionName ? rolePermissions[permissionName] || false : false;
                        
                        return (
                          <td key={operation} className="text-center">
                            {permission ? (
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => 
                                    handlePermissionChange(permissionName!, e.target.checked)
                                  }
                                  title={permission.description}
                                />
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button 
                type="button"
                className="btn btn-primary px-4"
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Save Permissions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Role Descriptions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="p-3 border rounded">
                <span className="badge bg-warning text-dark mb-2">SUPER ADMIN</span>
                <p className="small text-muted mb-0">
                  Full system access. Cannot be modified. Can manage all users and permissions.
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 border rounded">
                <span className="badge bg-primary mb-2">ADMIN</span>
                <p className="small text-muted mb-0">
                  High-level access to most features. Can manage inventory, orders, customers, and view reports.
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 border rounded">
                <span className="badge bg-success mb-2">STAFF</span>
                <p className="small text-muted mb-0">
                  Limited access for day-to-day operations. Can view and edit basic inventory and customer data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionManagement;