import React, { useState } from 'react';
import { Route } from 'wouter';
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
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SafeComponent from './components/ui/SafeComponent';
import ErrorPage from './pages/ErrorPage';

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

  const renderPage = (title: string, subtitle: string, PageComponent: React.ComponentType) => (
    <>
      <TopNav 
        title={title}
        subtitle={subtitle}
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-fill">
        <div className="container-fluid p-4 animate-fade-in-up">
          <PageComponent />
        </div>
      </main>
    </>
  );

  return (
    <div className="d-flex" style={{minHeight: '100vh'}}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Route path="/" nest>
          <Route path="/">
            {() => renderPage("Dashboard", "Overview of your business metrics", Home)}
          </Route>
          <Route path="/dashboard">
            {() => renderPage("Dashboard", "Overview of your business metrics", Home)}
          </Route>
          <Route path="/inventory">
            {() => renderPage("Inventory Management", "Manage your products and stock levels", Inventory)}
          </Route>
          <Route path="/advanced-inventory">
            {() => renderPage("Advanced Inventory", "AI-powered inventory insights and forecasting", AdvancedInventory)}
          </Route>
          <Route path="/customers">
            {() => renderPage("Customer Management", "Manage customer relationships and data", Customers)}
          </Route>
          <Route path="/customer-portal">
            {() => renderPage("Customer Portal", "Customer-facing dashboard and account management", CustomerPortal)}
          </Route>
          <Route path="/loyalty">
            {() => renderPage("Loyalty Program", "Manage customer loyalty and rewards", Loyalty)}
          </Route>
          <Route path="/subscriptions">
            {() => renderPage("Subscriptions", "Manage recurring subscriptions and billing", Subscriptions)}
          </Route>
          <Route path="/vendors">
            {() => renderPage("Vendor Management", "Manage suppliers and vendor relationships", VendorManagement)}
          </Route>
          <Route path="/ai-recommendations">
            {() => renderPage("AI Insights", "AI-powered business recommendations and analytics", AIRecommendations)}
          </Route>
          <Route path="/ai-insights">
            {() => renderPage("AI Insights", "AI-powered business recommendations and analytics", AIRecommendations)}
          </Route>
          <Route path="/reports">
            {() => renderPage("Finance & Reports", "Financial analytics and business reports", Reports)}
          </Route>
          <Route path="/settings">
            {() => renderPage("System Settings", "Configure system preferences and settings", SystemSettings)}
          </Route>
          <Route path="/user-management">
            {() => renderPage("User Management", "Manage system users and access", UserManagement)}
          </Route>
          <Route path="/role-permissions">
            {() => renderPage("Role & Permissions", "Configure user roles and access permissions", RolePermissionManagement)}
          </Route>
          <Route path="/integrations">
            {() => renderPage("Integrations", "Connect third-party services and tools", Integrations)}
          </Route>
          <Route path="/accounting/chart-of-accounts">
            {() => renderPage("Chart of Accounts", "Manage your accounting structure and classifications", ChartOfAccounts)}
          </Route>
          <Route path="/accounting/general-ledger">
            {() => renderPage("General Ledger", "Complete record of all accounting transactions", GeneralLedger)}
          </Route>
          <Route path="/accounting/journal-entries">
            {() => renderPage("Journal Entries", "View and manage all journal entries", JournalEntries)}
          </Route>
          <Route path="/accounting/manual-journal-entry">
            {() => renderPage("Manual Journal Entry", "Create manual journal entries with double-entry validation", ManualJournalEntry)}
          </Route>
          <Route path="/accounting/accounts-receivable">
            {() => renderPage("Accounts Receivable", "Manage customer invoices and aging analysis", AccountsReceivable)}
          </Route>
          <Route path="/accounting/accounts-payable">
            {() => renderPage("Accounts Payable", "Manage vendor bills and aging analysis", AccountsPayable)}
          </Route>
          <Route path="/accounting/wallets">
            {() => renderPage("Wallets & Credits", "Manage customer and vendor credit wallets", Wallets)}
          </Route>
          <Route path="/accounting/financial-reports">
            {() => renderPage("Financial Reports", "Generate comprehensive financial statements", FinancialReports)}
          </Route>
          <Route path="/accounting/bank-reconciliation">
            {() => renderPage("Bank Reconciliation", "Upload and match bank statements with general ledger", BankReconciliation)}
          </Route>
          <Route path="/accounting/invoices">
            {() => renderPage("Invoice Management", "Enhanced invoice management with aging reports", InvoiceManagement)}
          </Route>
          <Route path="/tax-management">
            {() => renderPage("Tax Management", "Manage tax rates and generate tax reports", TaxManagement)}
          </Route>
          
          {/* Catch-all route for 404 - MUST BE LAST */}
          <Route path="*">
            {() => <div data-testid="not-found-page"><NotFound /></div>}
          </Route>
        </Route>
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
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PermissionProvider>
            <ThemeProvider>
              <div className="app">
                <SafeComponent>
                  <AppContent />
                </SafeComponent>
                <Toaster />
              </div>
            </ThemeProvider>
          </PermissionProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;