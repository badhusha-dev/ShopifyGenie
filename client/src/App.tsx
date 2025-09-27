import React, { useState, useEffect } from 'react';
import { Route, useLocation } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { PermissionProvider } from './contexts/PermissionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import TopNav from './components/TopNav';
import { LoginForm } from './components/LoginForm';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Provider } from 'react-redux';
import { store } from './store'; // Import the Redux store

// Pages
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import InventoryReports from './pages/InventoryReports';
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

// Redux Auth Provider
import { ReduxAuthProvider } from './components/ReduxAuthProvider';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { fetchCurrentUser } from './store/slices/authSlice';


const AppContent = () => {
  const { user, isLoading } = useAppSelector((state) => state.auth); // Use Redux state
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
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarCollapsed ? '' : 'show'} d-lg-none`}
        onClick={() => setSidebarCollapsed(true)}
      ></div>

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Route path="/" component={() => renderPage("Dashboard", "Overview of your business metrics", Home)} />
        <Route path="/dashboard" component={() => renderPage("Dashboard", "Overview of your business metrics", Home)} />
        <Route path="/inventory" component={() => renderPage("Inventory Management", "Manage your products and stock levels", Inventory)} />
        <Route path="/inventory-reports" component={() => renderPage("Inventory Reports", "Comprehensive inventory analytics and reports", InventoryReports)} />
        <Route path="/advanced-inventory" component={() => renderPage("Advanced Inventory", "AI-powered inventory insights and forecasting", AdvancedInventory)} />
        <Route path="/customers" component={() => renderPage("Customer Management", "Manage customer relationships and data", Customers)} />
        <Route path="/customer-portal" component={() => renderPage("Customer Portal", "Customer-facing dashboard and account management", CustomerPortal)} />
        <Route path="/loyalty" component={() => renderPage("Loyalty Program", "Manage customer loyalty and rewards", Loyalty)} />
        <Route path="/subscriptions" component={() => renderPage("Subscriptions", "Manage recurring subscriptions and billing", Subscriptions)} />
        <Route path="/vendors" component={() => renderPage("Vendor Management", "Manage suppliers and vendor relationships", VendorManagement)} />
        <Route path="/ai-recommendations" component={() => renderPage("AI Insights", "AI-powered business recommendations and analytics", AIRecommendations)} />
        <Route path="/ai-insights" component={() => renderPage("AI Insights", "AI-powered business recommendations and analytics", AIRecommendations)} />
        <Route path="/reports" component={() => renderPage("Finance & Reports", "Financial analytics and business reports", Reports)} />
        <Route path="/settings" component={() => renderPage("System Settings", "Configure system preferences and settings", SystemSettings)} />
        <Route path="/user-management" component={() => renderPage("User Management", "Manage system users and access", UserManagement)} />
        <Route path="/role-permissions" component={() => renderPage("Role & Permissions", "Configure user roles and access permissions", RolePermissionManagement)} />
        <Route path="/integrations" component={() => renderPage("Integrations", "Connect third-party services and tools", Integrations)} />
        <Route path="/accounting/chart-of-accounts" component={() => renderPage("Chart of Accounts", "Manage your accounting structure and classifications", ChartOfAccounts)} />
        <Route path="/accounting/general-ledger" component={() => renderPage("General Ledger", "Complete record of all accounting transactions", GeneralLedger)} />
        <Route path="/accounting/journal-entries" component={() => renderPage("Journal Entries", "View and manage all journal entries", JournalEntries)} />
        <Route path="/accounting/manual-journal-entry" component={() => renderPage("Manual Journal Entry", "Create manual journal entries with double-entry validation", ManualJournalEntry)} />
        <Route path="/accounting/accounts-receivable" component={() => renderPage("Accounts Receivable", "Manage customer invoices and aging analysis", AccountsReceivable)} />
        <Route path="/accounting/accounts-payable" component={() => renderPage("Accounts Payable", "Manage vendor bills and aging analysis", AccountsPayable)} />
        <Route path="/accounting/wallets" component={() => renderPage("Wallets & Credits", "Manage customer and vendor credit wallets", Wallets)} />
        <Route path="/accounting/financial-reports" component={() => renderPage("Financial Reports", "Generate comprehensive financial statements", FinancialReports)} />
        <Route path="/accounting/bank-reconciliation" component={() => renderPage("Bank Reconciliation", "Upload and match bank statements with general ledger", BankReconciliation)} />
        <Route path="/accounting/invoices" component={() => renderPage("Invoice Management", "Enhanced invoice management with aging reports", InvoiceManagement)} />
        <Route path="/tax-management" component={() => renderPage("Tax Management", "Manage tax rates and generate tax reports", TaxManagement)} />

        {/* Catch-all route for 404 - MUST BE LAST */}
        <Route>
          {(params) => {
            // Only show NotFound for unmatched routes
            const currentPath = window.location.pathname;
            const validPaths = [
              '/', '/dashboard', '/inventory', '/inventory-reports', '/advanced-inventory', '/customers', '/customer-portal',
              '/loyalty', '/subscriptions', '/vendors', '/ai-recommendations', '/ai-insights', '/reports',
              '/settings', '/user-management', '/role-permissions', '/integrations',
              '/accounting/chart-of-accounts', '/accounting/general-ledger', '/accounting/journal-entries',
              '/accounting/manual-journal-entry', '/accounting/accounts-receivable', '/accounting/accounts-payable',
              '/accounting/wallets', '/accounting/financial-reports', '/accounting/bank-reconciliation',
              '/accounting/invoices', '/tax-management'
            ];

            if (!validPaths.includes(currentPath)) {
              return <NotFound />;
            }

            return null;
          }}
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
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize app by fetching current user if token exists
    if (token && !user) { // Check if user is not already loaded
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token, user]);

  return (
    <ReduxAuthProvider>
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
    </ReduxAuthProvider>
  );
}

export default App;