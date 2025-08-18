import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "./pages/not-found";
import { RoleProvider } from "./components/RoleProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PermissionProvider } from './contexts/PermissionContext';
import Sidebar from "./components/Sidebar";
import LoginForm from "./components/LoginForm";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Customers from "./pages/Customers";
import Subscriptions from "./pages/Subscriptions";
import Loyalty from "./pages/Loyalty";
import Reports from "./pages/Reports";
import CustomerPortal from "./pages/CustomerPortal";
import AdvancedInventory from "./pages/AdvancedInventory";
import AIRecommendations from "./pages/AIRecommendations";
import VendorManagement from "./pages/VendorManagement";
import UserManagement from "./pages/UserManagement";
import RolePermissionManagement from './pages/RolePermissionManagement';
import AlertSystem from "./components/AlertSystem";
import "./index.css";

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm
        onToggleMode={() => setShowRegister(!showRegister)}
        showRegister={showRegister}
      />
    );
  }

  return (
    <PermissionProvider>
      <RoleProvider>
        <div className="d-flex">
          <Sidebar />
          <div className="main-content flex-grow-1">
            <AlertSystem />
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/customers" component={Customers} />
              <Route path="/subscriptions" component={Subscriptions} />
              <Route path="/loyalty" component={Loyalty} />
              <Route path="/reports" component={Reports} />
              <Route path="/customer-portal" component={CustomerPortal} />
              <Route path="/ai-insights" component={Reports} />
              <Route path="/ai-recommendations" component={AIRecommendations} />
              <Route path="/advanced-inventory" component={AdvancedInventory} />
              <Route path="/vendor-management" component={VendorManagement} />
              <Route path="/user-management" component={UserManagement} />
              <Route path="/role-permission-management" component={RolePermissionManagement} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </RoleProvider>
    </PermissionProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;