
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Heart, 
  CreditCard, 
  Building2, 
  Brain, 
  DollarSign, 
  Settings,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Inventory',
    icon: Package,
    href: '/inventory',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Customers',
    icon: Users,
    href: '/customers',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Loyalty',
    icon: Heart,
    href: '/loyalty',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Subscriptions',
    icon: CreditCard,
    href: '/subscriptions',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Vendors',
    icon: Building2,
    href: '/vendors',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'AI Insights',
    icon: Brain,
    href: '/ai-recommendations',
    roles: ['superadmin', 'admin', 'staff']
  },
  {
    title: 'Finance',
    icon: DollarSign,
    href: '/reports',
    roles: ['superadmin', 'admin']
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    roles: ['superadmin', 'admin']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ShopifyApp</h1>
              <p className="text-xs text-gray-500">Business Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-gradient-to-br from-coral-500 to-emerald-500 text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-gradient-to-r from-coral-50 to-emerald-50 border border-coral-200/50 text-coral-700"
                  )}
                >
                  <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};
