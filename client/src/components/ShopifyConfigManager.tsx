import React, { useState } from 'react';
import { useShopifyConfigs, useSaveShopifyConfig, useUpdateShopifyConfig, useDeleteShopifyConfig } from '../hooks/useApi';
import { ShopifyConfigRequest } from '../lib/api';

interface ShopifyConfigFormProps {
  config?: {
    id: number;
    shopDomain: string;
    accessToken: string;
    webhookSecret?: string;
  };
  onClose: () => void;
}

const ShopifyConfigForm: React.FC<ShopifyConfigFormProps> = ({ config, onClose }) => {
  const [formData, setFormData] = useState({
    shopDomain: config?.shopDomain || '',
    accessToken: config?.accessToken || '',
    webhookSecret: config?.webhookSecret || '',
  });

  const saveMutation = useSaveShopifyConfig();
  const updateMutation = useUpdateShopifyConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const configData: ShopifyConfigRequest = {
        shopDomain: formData.shopDomain,
        accessToken: formData.accessToken,
        webhookSecret: formData.webhookSecret || undefined,
      };

      if (config) {
        await updateMutation.mutateAsync({ id: config.id, config: configData });
      } else {
        await saveMutation.mutateAsync(configData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving Shopify config:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isLoading = saveMutation.isPending || updateMutation.isPending;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {config ? 'Edit Shopify Configuration' : 'Add Shopify Configuration'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="shopDomain" className="form-label">Shop Domain</label>
                <input
                  type="text"
                  className="form-control"
                  id="shopDomain"
                  name="shopDomain"
                  value={formData.shopDomain}
                  onChange={handleChange}
                  placeholder="your-shop.myshopify.com"
                  required
                />
                <div className="form-text">Enter your Shopify store domain (e.g., your-shop.myshopify.com)</div>
              </div>

              <div className="mb-3">
                <label htmlFor="accessToken" className="form-label">Access Token</label>
                <input
                  type="password"
                  className="form-control"
                  id="accessToken"
                  name="accessToken"
                  value={formData.accessToken}
                  onChange={handleChange}
                  placeholder="shpat_..."
                  required
                />
                <div className="form-text">Your Shopify private app access token</div>
              </div>

              <div className="mb-3">
                <label htmlFor="webhookSecret" className="form-label">Webhook Secret (Optional)</label>
                <input
                  type="password"
                  className="form-control"
                  id="webhookSecret"
                  name="webhookSecret"
                  value={formData.webhookSecret}
                  onChange={handleChange}
                  placeholder="webhook-secret"
                />
                <div className="form-text">Webhook secret for verifying Shopify webhooks</div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  config ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ShopifyConfigManager: React.FC = () => {
  const { data: configs, isLoading, error } = useShopifyConfigs();
  const deleteMutation = useDeleteShopifyConfig();
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  const handleEdit = (config: any) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting config:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConfig(null);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Error loading Shopify configurations: {error.message}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-store me-2"></i>
              Shopify Configurations
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Configuration
            </button>
          </div>

          {configs && configs.length > 0 ? (
            <div className="row">
              {configs.map((config) => (
                <div key={config.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="fab fa-shopify me-2"></i>
                        {config.shopDomain}
                      </h5>
                      <p className="card-text">
                        <small className="text-muted">
                          Created: {new Date(config.createdAt).toLocaleDateString()}
                        </small>
                      </p>
                      <div className="d-flex align-items-center mb-2">
                        <span className={`badge ${config.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleEdit(config)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(config.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-5">
              <i className="fas fa-store fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">No Shopify Configurations</h4>
              <p className="text-muted">
                Add your first Shopify store configuration to get started.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Configuration
              </button>
            </div>
          )}

          {showForm && (
            <ShopifyConfigForm
              config={editingConfig}
              onClose={handleCloseForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopifyConfigManager;
