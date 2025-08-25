import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { 
  Settings, 
  Bell, 
  Shield, 
  FileText, 
  Users,
  TestTube,
  Activity,
  MessageSquare
} from 'lucide-react';

const SystemSettings: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [testNotification, setTestNotification] = useState({
    title: '',
    message: '',
    type: 'info'
  });

  // Fetch system settings
  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/system/settings'],
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: auditLoading } = useQuery({
    queryKey: ['/api/system/audit-logs'],
  });

  // Fetch permissions
  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/system/permissions'],
  });

  // Fetch role permissions
  const { data: rolePermissions = {}, isLoading: rolePermissionsLoading } = useQuery({
    queryKey: ['/api/system/roles', selectedRole, 'permissions'],
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: (data: { id: string; value: string }) =>
      apiRequest('PUT', `/api/system/settings/${data.id}`, { value: data.value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
      toast({ title: 'Success', description: 'Setting updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update setting', variant: 'destructive' });
    },
  });

  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/system/test-notification', data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Test notification sent' });
      setTestNotification({ title: '', message: '', type: 'info' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send test notification', variant: 'destructive' });
    },
  });

  const handleSettingUpdate = (settingId: string, value: string) => {
    updateSettingMutation.mutate({ id: settingId, value });
  };

  const handleTestNotification = () => {
    testNotificationMutation.mutate(testNotification);
  };

  const handleBroadcastAlert = () => {
    // Mock broadcast functionality
    toast({ title: 'Success', description: 'Alert broadcast successfully' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <span className="text-green-500">+</span>;
      case 'update': return <span className="text-blue-500">↻</span>;
      case 'delete': return <span className="text-red-500">×</span>;
      default: return <span className="text-gray-500">•</span>;
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="system-settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8" />
            {t('system.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage system configuration, permissions, and monitoring
          </p>
        </div>
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

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('system.generalSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settingsLoading ? (
                <div className="text-center py-8">Loading settings...</div>
              ) : (
                <div className="grid gap-4">
                  {Array.isArray(settings) && settings.length > 0 ? (
                    settings
                      .filter((setting: any) => setting.category === 'general')
                      .map((setting: any) => (
                        <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <Label className="font-medium">{setting.key?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</Label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {setting.type === 'boolean' ? (
                              <Switch
                                checked={setting.value === 'true'}
                                onCheckedChange={(checked) => handleSettingUpdate(setting.id, String(checked))}
                                disabled={!setting.isEditable}
                              />
                            ) : (
                              <Input
                                type={setting.type === 'number' ? 'number' : 'text'}
                                value={setting.value}
                                onChange={(e) => handleSettingUpdate(setting.id, e.target.value)}
                                disabled={!setting.isEditable}
                                className="w-32"
                              />
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No settings available</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('system.notificationSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(settings) && settings.length > 0 ? (
                  settings
                    .filter((setting: any) => setting.category === 'notifications')
                    .map((setting: any) => (
                      <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <Label className="font-medium">{setting.key?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</Label>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch
                          checked={setting.value === 'true'}
                          onCheckedChange={(checked) => handleSettingUpdate(setting.id, String(checked))}
                          disabled={!setting.isEditable}
                        />
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No notification settings available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Test Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Notification title"
                      value={testNotification.title}
                      onChange={(e) => setTestNotification(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Input
                      placeholder="Notification message"
                      value={testNotification.message}
                      onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleTestNotification}
                      disabled={testNotificationMutation.isPending}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Test
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleBroadcastAlert}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Broadcast Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('system.securitySettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(settings) && settings.length > 0 ? (
                settings
                  .filter((setting: any) => setting.category === 'security')
                  .map((setting: any) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label className="font-medium">{setting.key?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={setting.value}
                          onChange={(e) => handleSettingUpdate(setting.id, e.target.value)}
                          disabled={!setting.isEditable}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No security settings available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('system.auditLogs')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="text-center py-8">Loading audit logs...</div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getActionIcon(log.action)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{log.action}</span>
                              <span className="text-muted-foreground">on</span>
                              <Badge variant="outline">{log.resource}</Badge>
                              {log.resourceId && (
                                <span className="text-xs text-muted-foreground">#{log.resourceId}</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              User {log.userId} • {formatDate(log.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No audit logs found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;