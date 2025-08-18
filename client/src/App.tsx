import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Inventory from "@/pages/Inventory";
import Loyalty from "@/pages/Loyalty";
import Subscriptions from "@/pages/Subscriptions";
import Customers from "@/pages/Customers";
import Reports from "@/pages/Reports";
import CustomerPortal from "@/pages/CustomerPortal";
import Sidebar from "./components/Sidebar";
import { RoleProvider } from "./components/RoleProvider";
import AlertSystem from "./components/AlertSystem";

function Router() {
  return (
    <RoleProvider>
      <div className="d-flex">
        <Sidebar />
        <div className="main-content flex-grow-1">
          <AlertSystem />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/loyalty" component={Loyalty} />
            <Route path="/subscriptions" component={Subscriptions} />
            <Route path="/customers" component={Customers} />
            <Route path="/reports" component={Reports} />
            <Route path="/portal" component={CustomerPortal} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </RoleProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
