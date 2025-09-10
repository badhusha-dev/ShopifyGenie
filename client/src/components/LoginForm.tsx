import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, clearError } from '../store/slices/authSlice';
import { useAppSelector as useThemeSelector } from '../store/hooks';
import { useLogin, useRegister } from '../hooks/useApi';

interface LoginFormProps {
  onToggleMode: () => void;
  showRegister: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, showRegister }) => {
  const dispatch = useAppDispatch();
  const { error, isLoading } = useAppSelector((state) => state.auth);
  const { isDark } = useThemeSelector((state) => state.theme);
  
  // API hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (showRegister) {
        // Use API hook for registration
        const response = await registerMutation.mutateAsync({
          username: formData.email, // Backend expects username field
          password: formData.password
        });
        
        // Update Redux store with the response
        dispatch(loginUser({
          email: response.user.email,
          password: formData.password
        }));
      } else {
        // Use API hook for login
        const response = await loginMutation.mutateAsync({
          username: formData.email, // Backend expects username field
          password: formData.password
        });
        
        // Update Redux store with the response
        dispatch(loginUser({
          email: response.user.email,
          password: formData.password
        }));
      }
    } catch (err) {
      // Error handled by Redux slice
      console.error('Authentication error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="text-primary">
              <i className="fas fa-store me-2"></i>
              ShopifyApp
            </h2>
            <p className="text-muted">
              {showRegister ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {showRegister && (
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {showRegister && (
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={isLoading || loginMutation.isPending || registerMutation.isPending}
            >
              {(isLoading || loginMutation.isPending || registerMutation.isPending) ? (
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : null}
              {showRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={onToggleMode}
            >
              {showRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {!showRegister && (
            <div className="mt-3">
              <hr />
              <div className="text-center">
                <small className="text-muted">Demo Credentials:</small>
                <div className="mt-1">
                  <small className="d-block text-warning">Super Admin: superadmin@shopifyapp.com / superadmin123</small>
                  <small className="d-block">Admin: admin@shopifyapp.com / admin123</small>
                  <small className="d-block">Staff: staff@shopifyapp.com / staff123</small>
                  <small className="d-block">Customer: customer@example.com / customer123</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { LoginForm };