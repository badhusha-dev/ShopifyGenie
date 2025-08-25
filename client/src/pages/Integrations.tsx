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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { 
  Settings, 
  CreditCard, 
  Mail, 
  MessageSquare, 
  Calculator,
  Check,
  X,
  ExternalLink,
  TestTube,
  Save,
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'payment' | 'email' | 'sms' | 'accounting';
  isEnabled: boolean;
  config: string;
  credentials: string | null;
  webhookUrl: string;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const Integrations: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configData, setConfigData] = useState<any>({});
  const [credentialsData, setCredentialsData] = useState<any>({});

  // Fetch integrations
  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['/api/integrations'],
  });

  // Update integration mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: (data: { name: string; config?: any; credentials?: any; isEnabled?: boolean }) =>
      apiRequest('PUT', `/api/integrations/${data.name}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({ title: 'Success', description: 'Integration updated successfully' });
      setIsConfigDialogOpen(false);
      setSelectedIntegration(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update integration', variant: 'destructive' });
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (name: string): Promise<TestResult> => {
      const response = await apiRequest('POST', `/api/integrations/${name}/test`);
      return response as TestResult;
    },
    onSuccess: (result: TestResult) => {
      toast({ 
        title: result.success ? 'Success' : 'Error', 
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to test integration', variant: 'destructive' });
    },
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-6 h-6" />;
      case 'email': return <Mail className="w-6 h-6" />;
      case 'sms': return <MessageSquare className="w-6 h-6" />;
      case 'accounting': return <Calculator className="w-6 h-6" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const getIntegrationTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      case 'accounting': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleIntegration = (integration: Integration) => {
    updateIntegrationMutation.mutate({
      name: integration.id,
      isEnabled: !integration.isEnabled
    });
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    const parsedConfig = integration.config ? JSON.parse(integration.config) : {};
    setConfigData(parsedConfig);
    setCredentialsData({});
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfiguration = () => {
    if (!selectedIntegration) return;

    const updateData: any = {
      name: selectedIntegration.id,
      config: configData
    };

    // Only include credentials if they've been changed
    if (Object.keys(credentialsData).length > 0) {
      updateData.credentials = credentialsData;
    }

    updateIntegrationMutation.mutate(updateData);
  };

  const handleTestIntegration = (integrationName: string) => {
    testIntegrationMutation.mutate(integrationName);
  };

  const formatLastSync = (lastSyncAt: string | null) => {
    if (!lastSyncAt) return 'Never';
    return new Date(lastSyncAt).toLocaleString();
  };

  const renderStripeConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Publishable Key</Label>
        <Input
          type="text"
          placeholder="pk_test_..."
          value={configData.publishableKey || ''}
          onChange={(e) => setConfigData({...configData, publishableKey: e.target.value})}
        />
      </div>
      <div>
        <Label>Secret Key</Label>
        <Input
          type="password"
          placeholder="sk_test_..."
          value={credentialsData.secretKey || ''}
          onChange={(e) => setCredentialsData({...credentialsData, secretKey: e.target.value})}
        />
      </div>
      <div>
        <Label>Webhook Secret</Label>
        <Input
          type="password"
          placeholder="whsec_..."
          value={configData.webhookSecret || ''}
          onChange={(e) => setConfigData({...configData, webhookSecret: e.target.value})}
        />
      </div>
      <div>
        <Label>Currency</Label>
        <Input
          type="text"
          placeholder="usd"
          value={configData.currency || 'usd'}
          onChange={(e) => setConfigData({...configData, currency: e.target.value})}
        />
      </div>
    </div>
  );

  const renderSendGridConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>API Key</Label>
        <Input
          type="password"
          placeholder="SG...."
          value={credentialsData.apiKey || ''}
          onChange={(e) => setCredentialsData({...credentialsData, apiKey: e.target.value})}
        />
      </div>
      <div>
        <Label>From Email</Label>
        <Input
          type="email"
          placeholder="noreply@yourstore.com"
          value={configData.fromEmail || ''}
          onChange={(e) => setConfigData({...configData, fromEmail: e.target.value})}
        />
      </div>
      <div>
        <Label>From Name</Label>
        <Input
          type="text"
          placeholder="Your Store"
          value={configData.fromName || ''}
          onChange={(e) => setConfigData({...configData, fromName: e.target.value})}
        />
      </div>
    </div>
  );

  const renderTwilioConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Account SID</Label>
        <Input
          type="text"
          placeholder="AC..."
          value={credentialsData.accountSid || ''}
          onChange={(e) => setCredentialsData({...credentialsData, accountSid: e.target.value})}
        />
      </div>
      <div>
        <Label>Auth Token</Label>
        <Input
          type="password"
          placeholder="Auth Token"
          value={credentialsData.authToken || ''}
          onChange={(e) => setCredentialsData({...credentialsData, authToken: e.target.value})}
        />
      </div>
      <div>
        <Label>From Number</Label>
        <Input
          type="text"
          placeholder="+1234567890"
          value={configData.fromNumber || ''}
          onChange={(e) => setConfigData({...configData, fromNumber: e.target.value})}
        />
      </div>
    </div>
  );

  const renderQuickBooksConfig = () => (
    <div className="space-y-4">
      <div>
        <Label>Company ID</Label>
        <Input
          type="text"
          placeholder="Company ID"
          value={configData.companyId || ''}
          onChange={(e) => setConfigData({...configData, companyId: e.target.value})}
        />
      </div>
      <div>
        <Label>Base URL</Label>
        <Input
          type="text"
          placeholder="https://sandbox-quickbooks.api.intuit.com"
          value={configData.baseUrl || 'https://sandbox-quickbooks.api.intuit.com'}
          onChange={(e) => setConfigData({...configData, baseUrl: e.target.value})}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Auto Create Customers</Label>
        <Switch
          checked={configData.autoCreateCustomers || false}
          onCheckedChange={(checked) => setConfigData({...configData, autoCreateCustomers: checked})}
        />
      </div>
    </div>
  );

  const renderConfigurationForm = () => {
    if (!selectedIntegration) return null;

    switch (selectedIntegration.id) {
      case 'stripe':
        return renderStripeConfig();
      case 'sendgrid':
        return renderSendGridConfig();
      case 'twilio':
        return renderTwilioConfig();
      case 'quickbooks':
        return renderQuickBooksConfig();
      default:
        return <div>No configuration available for this integration.</div>;
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="integrations-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-8 h-8" />
            {t('integrations.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect and configure third-party services for enhanced functionality
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading integrations...</div>
        ) : (
          (integrations as Integration[]).map((integration: Integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getIntegrationTypeColor(integration.type)}`}>
                      {getIntegrationIcon(integration.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {integration.type}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={integration.isEnabled}
                    onCheckedChange={() => handleToggleIntegration(integration)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {integration.isEnabled ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500">{t('integrations.enabled')}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">{t('integrations.disabled')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span className="text-xs">{formatLastSync(integration.lastSyncAt)}</span>
                </div>

                {integration.syncStatus === 'error' && integration.errorLog && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Sync Error</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureIntegration(integration)}
                    className="flex-1"
                    data-testid={`configure-${integration.id}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('integrations.configure')}
                  </Button>
                  
                  {integration.isEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestIntegration(integration.id)}
                      disabled={testIntegrationMutation.isPending}
                      data-testid={`test-${integration.id}`}
                    >
                      <TestTube className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Webhook: {integration.webhookUrl}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration && getIntegrationIcon(selectedIntegration.type)}
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Configure the settings and credentials for this integration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {renderConfigurationForm()}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveConfiguration}
                disabled={updateIntegrationMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Integrations;