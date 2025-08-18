import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, Users, Settings } from 'lucide-react';

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
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Check if user has permission to view this screen
  if (user?.role !== 'superadmin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only Super Administrators can access the Role & Permission Management screen.</p>
          </CardContent>
        </Card>
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
      toast({
        title: "Error",
        description: "Failed to fetch permissions. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to fetch role permissions. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: `Permissions for ${selectedRole} role updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update role permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-yellow-500 text-yellow-900';
      case 'admin': return 'bg-blue-500 text-blue-900';
      case 'staff': return 'bg-green-500 text-green-900';
      case 'customer': return 'bg-gray-500 text-gray-900';
      default: return 'bg-gray-500 text-gray-900';
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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Role & Permission Management</h1>
        <p className="text-gray-600">
          Manage permissions for different user roles. Super Admin permissions cannot be modified.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Role Selection
              </CardTitle>
              <CardDescription>
                Select a role to view and modify its permissions
              </CardDescription>
            </div>
            <Badge className={getRoleBadgeClass(selectedRole)}>
              {selectedRole.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Label htmlFor="role-select">Role:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading permissions...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permission Matrix
            </CardTitle>
            <CardDescription>
              Check/uncheck permissions for the selected role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Module</th>
                    {operations.map(operation => (
                      <th key={operation} className="text-center p-3 font-semibold capitalize">
                        {operation}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <tr key={category} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium capitalize">
                        {category}
                      </td>
                      {operations.map(operation => {
                        const permission = categoryPermissions.find(p => p.operation === operation);
                        const permissionName = permission?.name;
                        const isChecked = permissionName ? rolePermissions[permissionName] || false : false;
                        
                        return (
                          <td key={operation} className="text-center p-3">
                            {permission ? (
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(permissionName!, !!checked)
                                }
                                title={permission.description}
                              />
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="px-6"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Permissions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Badge className="bg-yellow-500 text-yellow-900 mb-2">SUPER ADMIN</Badge>
              <p className="text-sm text-gray-600">
                Full system access. Cannot be modified. Can manage all users and permissions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="bg-blue-500 text-blue-900 mb-2">ADMIN</Badge>
              <p className="text-sm text-gray-600">
                High-level access to most features. Can manage inventory, orders, customers, and view reports.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge className="bg-green-500 text-green-900 mb-2">STAFF</Badge>
              <p className="text-sm text-gray-600">
                Limited access for day-to-day operations. Can view and edit basic inventory and customer data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissionManagement;