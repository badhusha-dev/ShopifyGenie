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
import ChartOfAccounts from './pages/ChartOfAccounts';
import GeneralLedger from './pages/GeneralLedger';
import JournalEntries from './pages/JournalEntries';
import AccountsReceivable from './pages/AccountsReceivable';
import AccountsPayable from './pages/AccountsPayable';
import Wallets from './pages/Wallets';
import FinancialReports from './pages/FinancialReports';
import ManualJournalEntry from './pages/ManualJournalEntry';
import BankReconciliation from './pages/BankReconciliation';
import InvoiceManagement from './pages/InvoiceManagement';
import TaxManagement from './pages/TaxManagement';
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

          <Route path="/chart-of-accounts" element={
            <>
              <TopNav 
                title="Chart of Accounts" 
                subtitle="Manage your accounting structure and classifications"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <ChartOfAccounts />
              </main>
            </>
          } />

          <Route path="/general-ledger" element={
            <>
              <TopNav 
                title="General Ledger" 
                subtitle="Complete record of all accounting transactions"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <GeneralLedger />
              </main>
            </>
          } />

          <Route path="/journal-entries" element={
            <>
              <TopNav 
                title="Journal Entries" 
                subtitle="Create and manage manual journal entries"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <JournalEntries />
              </main>
            </>
          } />

          <Route path="/accounts-receivable" element={
            <>
              <TopNav 
                title="Accounts Receivable" 
                subtitle="Manage customer invoices and aging analysis"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <AccountsReceivable />
              </main>
            </>
          } />

          <Route path="/accounts-payable" element={
            <>
              <TopNav 
                title="Accounts Payable" 
                subtitle="Manage vendor bills and aging analysis"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <AccountsPayable />
              </main>
            </>
          } />

          <Route path="/wallets" element={
            <>
              <TopNav 
                title="Wallets & Credits" 
                subtitle="Manage customer and vendor credit wallets"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <Wallets />
              </main>
            </>
          } />

          <Route path="/financial-reports" element={
            <>
              <TopNav 
                title="Financial Reports" 
                subtitle="Generate comprehensive financial statements"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <FinancialReports />
              </main>
            </>
          } />

          {/* Advanced Accounts Module Routes */}
          <Route path="/manual-journal-entry" element={
            <>
              <TopNav 
                title="Manual Journal Entry" 
                subtitle="Create manual journal entries with double-entry validation"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <ManualJournalEntry />
              </main>
            </>
          } />

          <Route path="/bank-reconciliation" element={
            <>
              <TopNav 
                title="Bank Reconciliation" 
                subtitle="Upload and match bank statements with general ledger"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <BankReconciliation />
              </main>
            </>
          } />

          <Route path="/invoice-management" element={
            <>
              <TopNav 
                title="Invoice Management" 
                subtitle="Enhanced invoice management with aging reports"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <InvoiceManagement />
              </main>
            </>
          } />

          <Route path="/tax-management" element={
            <>
              <TopNav 
                title="Tax Management" 
                subtitle="Manage tax rates and generate tax reports"
                onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <main className="flex-fill">
                <TaxManagement />
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