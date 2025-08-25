
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Bell, 
  Shield, 
  FileText,
  Save,
  Eye,
  User,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systemSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await fetch('/api/system/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      
      // Convert to settings object
      const settingsObj: Record<string, string> = {};
      data.forEach((setting: Setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);
      
      return data;
    }
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/system/audit-logs');
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Record<string, string>) => {
      const response = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <span className="text-emerald-600">+</span>;
      case 'update': return <span className="text-blue-600">✎</span>;
      case 'delete': return <span className="text-red-600">×</span>;
      case 'view': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <span className="text-gray-600">•</span>;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-100 text-emerald-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure your application settings and monitor system activity</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={settings.company_name || ''}
                    onChange={(e) => handleSettingChange('company_name', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                  <Input
                    id="low_stock_threshold"
                    type="number"
                    value={settings.low_stock_threshold || '10'}
                    onChange={(e) => handleSettingChange('low_stock_threshold', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Input
                    id="default_currency"
                    value={settings.default_currency || 'USD'}
                    onChange={(e) => handleSettingChange('default_currency', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone || 'UTC'}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-coral-600 hover:bg-coral-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={settings.email_notifications === 'true'}
                    onCheckedChange={(checked) => handleSettingChange('email_notifications', checked.toString())}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                    <p className="text-sm text-gray-500">Get notified when products are running low</p>
                  </div>
                  <Switch
                    id="low_stock_alerts"
                    checked={settings.low_stock_alerts === 'true'}
                    onCheckedChange={(checked) => handleSettingChange('low_stock_alerts', checked.toString())}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="order_notifications">Order Notifications</Label>
                    <p className="text-sm text-gray-500">Receive alerts for new orders and updates</p>
                  </div>
                  <Switch
                    id="order_notifications"
                    checked={settings.order_notifications === 'true'}
                    onCheckedChange={(checked) => handleSettingChange('order_notifications', checked.toString())}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-coral-600 hover:bg-coral-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two_factor_auth">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    id="two_factor_auth"
                    checked={settings.two_factor_auth === 'true'}
                    onCheckedChange={(checked) => handleSettingChange('two_factor_auth', checked.toString())}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.session_timeout || '30'}
                    onChange={(e) => handleSettingChange('session_timeout', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password_complexity">Enforce Password Complexity</Label>
                    <p className="text-sm text-gray-500">Require strong passwords for all users</p>
                  </div>
                  <Switch
                    id="password_complexity"
                    checked={settings.password_complexity === 'true'}
                    onCheckedChange={(checked) => handleSettingChange('password_complexity', checked.toString())}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-coral-600 hover:bg-coral-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-6">
                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium">Action</TableHead>
                      <TableHead className="font-medium">User</TableHead>
                      <TableHead className="font-medium">Timestamp</TableHead>
                      <TableHead className="font-medium">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No audit logs available
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs.map((log: AuditLog) => (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Badge className={getActionColor(log.action)}>
                              {getActionIcon(log.action)}
                              <span className="ml-1">{log.action}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {log.user}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
