import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import { useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import TopNav from './components/TopNav';
import { LoginForm } from './components/LoginForm';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

// Pages
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import AdvancedInventory from './pages/AdvancedInventory';
import Customers from './pages/Customers';
import CustomerPortal from './pages/CustomerPortal';
import Loyalty from './pages/Loyalty';
import Subscriptions from './pages/Subscriptions';
import VendorManagement from './pages/VendorManagement';
import AIRecommendations from './pages/AIRecommendations';
import Reports from './pages/Reports';
import SystemSettings from './pages/SystemSettings';
import UserManagement from './pages/UserManagement';
import RolePermissionManagement from './pages/RolePermissionManagement';
import Integrations from './pages/Integrations';
import NotFound from './pages/not-found';

// Design Tokens
import './design/tokens.scss'; // Import design tokens

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 to-emerald-50">
        <LoginForm
          onToggleMode={() => setShowRegister(!showRegister)}
          showRegister={showRegister}
        />
      </div>
    );
  }

  return (
    <div className="d-flex" style={{minHeight: '100vh'}}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Routes>
          <Route path="/" element={
            <>
              <TopNav 
                title="Dashboard" 
                subtitle="Overview of your business metrics"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Home />
                </div>
              </main>
            </>
          } />

          <Route path="/inventory" element={
            <>
              <TopNav 
                title="Inventory Management" 
                subtitle="Manage your products and stock levels"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Inventory />
                </div>
              </main>
            </>
          } />

          <Route path="/advanced-inventory" element={
            <>
              <TopNav 
                title="Advanced Inventory" 
                subtitle="AI-powered inventory insights and forecasting"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <AdvancedInventory />
                </div>
              </main>
            </>
          } />

          <Route path="/customers" element={
            <>
              <TopNav 
                title="Customer Management" 
                subtitle="Manage customer relationships and data"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Customers />
                </div>
              </main>
            </>
          } />

          <Route path="/customer-portal" element={
            <>
              <TopNav 
                title="Customer Portal" 
                subtitle="Customer-facing dashboard and account management"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <CustomerPortal />
                </div>
              </main>
            </>
          } />

          <Route path="/loyalty" element={
            <>
              <TopNav 
                title="Loyalty Program" 
                subtitle="Manage customer loyalty and rewards"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Loyalty />
                </div>
              </main>
            </>
          } />

          <Route path="/subscriptions" element={
            <>
              <TopNav 
                title="Subscriptions" 
                subtitle="Manage recurring subscriptions and billing"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Subscriptions />
                </div>
              </main>
            </>
          } />

          <Route path="/vendors" element={
            <>
              <TopNav 
                title="Vendor Management" 
                subtitle="Manage suppliers and vendor relationships"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <VendorManagement />
                </div>
              </main>
            </>
          } />

          <Route path="/ai-recommendations" element={
            <>
              <TopNav 
                title="AI Insights" 
                subtitle="AI-powered business recommendations and analytics"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <AIRecommendations />
                </div>
              </main>
            </>
          } />

          <Route path="/reports" element={
            <>
              <TopNav 
                title="Finance & Reports" 
                subtitle="Financial analytics and business reports"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Reports />
                </div>
              </main>
            </>
          } />

          <Route path="/settings" element={
            <>
              <TopNav 
                title="System Settings" 
                subtitle="Configure system preferences and settings"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <SystemSettings />
                </div>
              </main>
            </>
          } />

          <Route path="/user-management" element={
            <>
              <TopNav 
                title="User Management" 
                subtitle="Manage system users and access"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <UserManagement />
                </div>
              </main>
            </>
          } />

          <Route path="/role-permissions" element={
            <>
              <TopNav 
                title="Role & Permissions" 
                subtitle="Configure user roles and access permissions"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <RolePermissionManagement />
                </div>
              </main>
            </>
          } />

          <Route path="/integrations" element={
            <>
              <TopNav 
                title="Integrations" 
                subtitle="Connect third-party services and tools"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <div className="container-fluid p-4 animate-fade-in-up">
                  <Integrations />
                </div>
              </main>
            </>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{zIndex: 1035}}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionProvider>
          <ThemeProvider> {/* Wrap with ThemeProvider */}
            <Router>
              <div className="app">
                <AppContent />
                <Toaster />
              </div>
            </Router>
          </ThemeProvider>
        </PermissionProvider>
      </AuthProvider>
      {/* Removed ReactQueryDevtools and Toaster from here as they are now in AppContent */}
    </QueryClientProvider>
  );
}

export default App;