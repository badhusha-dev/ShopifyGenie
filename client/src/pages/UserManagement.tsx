
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { Users, UserPlus, Edit, Trash2, Shield, Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  createdAt: string;
  updatedAt: string;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const { userRole } = useRole();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'superadmin' | 'admin' | 'staff' | 'customer'
  });

  const isSuperAdmin = userRole === 'superadmin';

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!token
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
      // Show success toast
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: { id: string } & Partial<typeof formData>) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'customer' });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'customer' });
    setEditingUser(null);
    setShowAddModal(false);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-warning text-dark'; // Gold/yellow
      case 'admin': return 'bg-primary'; // Blue
      case 'staff': return 'bg-success'; // Green
      case 'customer': return 'bg-secondary'; // Gray
      default: return 'bg-secondary';
    }
  };

  return (
    <>
      <TopNav 
        title="User Management" 
        subtitle="Manage user accounts and permissions"
      />
      
      <div className="content-wrapper">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>Users</h4>
            <p className="text-muted mb-0">
              {isSuperAdmin ? 'Manage system users and their roles' : 'View system users (read-only access)'}
            </p>
          </div>
          {isSuperAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add User
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: User) => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary rounded-circle d-flex align-items-center justify-content-center me-2">
                              <i className="fas fa-user text-white"></i>
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => handleEdit(user)}
                              disabled={!isSuperAdmin && user.role === 'superadmin'}
                              title={!isSuperAdmin && user.role === 'superadmin' ? 'Only Super Admin can edit Super Admin accounts' : ''}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            {isSuperAdmin && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(user.id)}
                                disabled={user.email === 'superadmin@shopifyapp.com'}
                                title={user.email === 'superadmin@shopifyapp.com' ? 'Cannot delete default Super Admin' : ''}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {showAddModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button type="button" className="btn-close" onClick={resetForm}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">
                        Password {editingUser && <small className="text-muted">(leave blank to keep current)</small>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      >
                        <option value="customer">Customer</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                      {createUserMutation.isPending || updateUserMutation.isPending ? (
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : null}
                      {editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserManagement;
