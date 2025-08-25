import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../hooks/useTranslation';
import { apiRequest } from '../lib/queryClient';

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
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState<any>({});
  const [credentialsData, setCredentialsData] = useState<any>({});
  const [activeTab, setActiveTab] = useState('all');

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
      setShowConfigModal(false);
      setSelectedIntegration(null);
    },
    onError: () => {
      console.error('Failed to update integration');
    },
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (name: string): Promise<TestResult> => {
      const response = await apiRequest('POST', `/api/integrations/${name}/test`);
      return response as TestResult;
    },
    onSuccess: (result: TestResult) => {
      console.log(result.success ? 'Test successful' : 'Test failed:', result.message);
    },
    onError: () => {
      console.error('Failed to test integration');
    },
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'payment': return 'fas fa-credit-card';
      case 'email': return 'fas fa-envelope';
      case 'sms': return 'fas fa-sms';
      case 'accounting': return 'fas fa-calculator';
      default: return 'fas fa-cog';
    }
  };

  const getIntegrationColor = (type: string) => {
    switch (type) {
      case 'payment': return 'success';
      case 'email': return 'primary';
      case 'sms': return 'purple';
      case 'accounting': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      idle: 'bg-secondary',
      syncing: 'bg-primary',
      error: 'bg-danger'
    };
    return <span className={`badge ${badgeClasses[status as keyof typeof badgeClasses] || 'bg-secondary'}`}>
      {status}
    </span>;
  };

  const handleToggleIntegration = (integration: Integration) => {
    updateIntegrationMutation.mutate({
      name: integration.id,
      isEnabled: !integration.isEnabled
    });
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigData(integration.config ? JSON.parse(integration.config) : {});
    setCredentialsData(integration.credentials ? JSON.parse(integration.credentials) : {});
    setShowConfigModal(true);
  };

  const handleSaveConfiguration = () => {
    if (selectedIntegration) {
      updateIntegrationMutation.mutate({
        name: selectedIntegration.id,
        config: configData,
        credentials: credentialsData
      });
    }
  };

  const filterIntegrations = (integrations: Integration[]) => {
    if (activeTab === 'all') return integrations;
    return integrations.filter(integration => integration.type === activeTab);
  };

  const getTabCount = (type: string) => {
    if (type === 'all') return integrations.length;
    return integrations.filter(integration => integration.type === type).length;
  };

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-12">
            <div className="placeholder-glow">
              <span className="placeholder col-4 mb-3"></span>
              <div className="row g-4">
                {[1, 2, 3, 4, 5, 6].map(index => (
                  <div key={index} className="col-lg-4 col-md-6">
                    <div className="placeholder" style={{height: '200px', borderRadius: '12px'}}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid animate-fade-in-up">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                <i className="fas fa-plug me-2 text-primary"></i>
                Integrations
              </h1>
              <p className="text-muted mb-0">Connect and manage your third-party services</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <i className="fas fa-sync-alt me-2"></i>
                Sync All
              </button>
              <button className="btn btn-shopify">
                <i className="fas fa-plus me-2"></i>
                Add Integration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill" id="integrationTab" role="tablist">
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
                type="button"
              >
                <i className="fas fa-th-large me-2"></i>
                All ({getTabCount('all')})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
                type="button"
              >
                <i className="fas fa-credit-card me-2"></i>
                Payment ({getTabCount('payment')})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
                type="button"
              >
                <i className="fas fa-envelope me-2"></i>
                Email ({getTabCount('email')})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'sms' ? 'active' : ''}`}
                onClick={() => setActiveTab('sms')}
                type="button"
              >
                <i className="fas fa-sms me-2"></i>
                SMS ({getTabCount('sms')})
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === 'accounting' ? 'active' : ''}`}
                onClick={() => setActiveTab('accounting')}
                type="button"
              >
                <i className="fas fa-calculator me-2"></i>
                Accounting ({getTabCount('accounting')})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="row g-4">
        {filterIntegrations(integrations).map((integration: Integration) => (
          <div key={integration.id} className="col-xl-4 col-lg-6">
            <div className="integration-card modern-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center">
                  <div className={`integration-icon bg-${getIntegrationColor(integration.type)}-subtle rounded-circle d-flex align-items-center justify-content-center me-3`} 
                       style={{width: '48px', height: '48px'}}>
                    <i className={`${getIntegrationIcon(integration.type)} text-${getIntegrationColor(integration.type)} fs-5`}></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">{integration.name}</h5>
                    <span className={`badge bg-${getIntegrationColor(integration.type)}-subtle text-${getIntegrationColor(integration.type)}`}>
                      {integration.type}
                    </span>
                  </div>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={integration.isEnabled}
                    onChange={() => handleToggleIntegration(integration)}
                    id={`switch-${integration.id}`}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">Status:</span>
                  {getStatusBadge(integration.syncStatus)}
                </div>
                {integration.lastSyncAt && (
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">Last Sync:</span>
                    <span className="small">{new Date(integration.lastSyncAt).toLocaleDateString()}</span>
                  </div>
                )}
                {integration.webhookUrl && (
                  <div className="mb-2">
                    <span className="text-muted small d-block">Webhook URL:</span>
                    <code className="small bg-light p-1 rounded d-block text-truncate">
                      {integration.webhookUrl}
                    </code>
                  </div>
                )}
              </div>

              {integration.errorLog && (
                <div className="alert alert-danger alert-sm mb-3" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <small>{integration.errorLog}</small>
                </div>
              )}

              <div className="d-flex gap-2 mt-auto">
                <button 
                  className="btn btn-outline-primary btn-sm flex-fill"
                  onClick={() => handleConfigureIntegration(integration)}
                >
                  <i className="fas fa-cog me-1"></i>
                  Configure
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => testIntegrationMutation.mutate(integration.id)}
                  disabled={testIntegrationMutation.isPending}
                >
                  {testIntegrationMutation.isPending ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="fas fa-vial"></i>
                  )}
                </button>
                <button className="btn btn-outline-info btn-sm">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filterIntegrations(integrations).length === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-plug text-muted" style={{fontSize: '4rem'}}></i>
              </div>
              <h4 className="text-muted mb-3">No integrations found</h4>
              <p className="text-muted mb-4">
                {activeTab === 'all' 
                  ? 'Start by adding your first integration to connect external services.'
                  : `No ${activeTab} integrations configured yet.`
                }
              </p>
              <button className="btn btn-shopify">
                <i className="fas fa-plus me-2"></i>
                Add Integration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`${getIntegrationIcon(selectedIntegration.type)} me-2`}></i>
                  Configure {selectedIntegration.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfigModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Configuration Tabs */}
                <ul className="nav nav-tabs" id="configTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      className="nav-link active" 
                      id="config-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#config-tab-pane" 
                      type="button"
                    >
                      <i className="fas fa-cog me-2"></i>Configuration
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className="nav-link" 
                      id="credentials-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#credentials-tab-pane" 
                      type="button"
                    >
                      <i className="fas fa-key me-2"></i>Credentials
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className="nav-link" 
                      id="webhook-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#webhook-tab-pane" 
                      type="button"
                    >
                      <i className="fas fa-link me-2"></i>Webhook
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="tab-content pt-4" id="configTabsContent">
                  {/* Configuration Tab */}
                  <div className="tab-pane fade show active" id="config-tab-pane">
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="apiEndpoint" className="form-label fw-semibold">API Endpoint</label>
                        <input
                          type="url"
                          className="form-control"
                          id="apiEndpoint"
                          value={configData.apiEndpoint || ''}
                          onChange={(e) => setConfigData({...configData, apiEndpoint: e.target.value})}
                          placeholder="https://api.example.com"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="timeout" className="form-label fw-semibold">Timeout (seconds)</label>
                        <input
                          type="number"
                          className="form-control"
                          id="timeout"
                          value={configData.timeout || '30'}
                          onChange={(e) => setConfigData({...configData, timeout: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="retryAttempts" className="form-label fw-semibold">Retry Attempts</label>
                        <input
                          type="number"
                          className="form-control"
                          id="retryAttempts"
                          value={configData.retryAttempts || '3'}
                          onChange={(e) => setConfigData({...configData, retryAttempts: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="enableLogging"
                            checked={configData.enableLogging || false}
                            onChange={(e) => setConfigData({...configData, enableLogging: e.target.checked})}
                          />
                          <label className="form-check-label fw-semibold" htmlFor="enableLogging">
                            Enable Debug Logging
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credentials Tab */}
                  <div className="tab-pane fade" id="credentials-tab-pane">
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="apiKey" className="form-label fw-semibold">API Key</label>
                        <input
                          type="password"
                          className="form-control"
                          id="apiKey"
                          value={credentialsData.apiKey || ''}
                          onChange={(e) => setCredentialsData({...credentialsData, apiKey: e.target.value})}
                          placeholder="Enter your API key"
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="clientId" className="form-label fw-semibold">Client ID</label>
                        <input
                          type="text"
                          className="form-control"
                          id="clientId"
                          value={credentialsData.clientId || ''}
                          onChange={(e) => setCredentialsData({...credentialsData, clientId: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="clientSecret" className="form-label fw-semibold">Client Secret</label>
                        <input
                          type="password"
                          className="form-control"
                          id="clientSecret"
                          value={credentialsData.clientSecret || ''}
                          onChange={(e) => setCredentialsData({...credentialsData, clientSecret: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Webhook Tab */}
                  <div className="tab-pane fade" id="webhook-tab-pane">
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="webhookUrl" className="form-label fw-semibold">Webhook URL</label>
                        <div className="input-group">
                          <input
                            type="url"
                            className="form-control"
                            id="webhookUrl"
                            value={selectedIntegration.webhookUrl}
                            disabled
                          />
                          <button className="btn btn-outline-secondary" type="button">
                            <i className="fas fa-copy"></i>
                          </button>
                        </div>
                        <div className="form-text">
                          Use this URL to receive webhook events from the integration
                        </div>
                      </div>
                      <div className="col-12">
                        <label htmlFor="webhookSecret" className="form-label fw-semibold">Webhook Secret</label>
                        <input
                          type="password"
                          className="form-control"
                          id="webhookSecret"
                          value={credentialsData.webhookSecret || ''}
                          onChange={(e) => setCredentialsData({...credentialsData, webhookSecret: e.target.value})}
                          placeholder="Optional webhook signature verification"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-shopify"
                  onClick={handleSaveConfiguration}
                  disabled={updateIntegrationMutation.isPending}
                >
                  {updateIntegrationMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        .integration-card {
          transition: all 0.3s ease;
          border: 1px solid #e0e6ed;
          display: flex;
          flex-direction: column;
        }

        .integration-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
          border-color: var(--shopify-green);
        }

        .integration-icon {
          transition: all 0.3s ease;
        }

        .integration-card:hover .integration-icon {
          transform: scale(1.1);
        }

        .nav-pills .nav-link {
          border-radius: 25px;
          transition: all 0.3s ease;
        }

        .nav-pills .nav-link:hover {
          background-color: var(--shopify-green-light);
          color: var(--shopify-green);
        }

        .nav-pills .nav-link.active {
          background-color: var(--shopify-green);
          color: white;
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Integrations;