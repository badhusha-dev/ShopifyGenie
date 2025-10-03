import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlay, FaPause, FaEdit, FaTrash, FaPlus, FaCog, FaClock, FaCheckCircle, FaExclamationTriangle, FaCalendar, FaTag, FaCode, FaChartLine, FaHistory, FaCopy, FaShare, FaDownload, FaUpload, FaFilter, FaSort, FaEye } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  status: 'active' | 'inactive' | 'draft';
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  successRate: number;
  schedule?: {
    type: 'immediate' | 'scheduled' | 'recurring';
    cron?: string;
    timezone?: string;
    startDate?: string;
    endDate?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  version: number;
  createdBy: string;
  lastModified: string;
  executionTimeout: number; // in seconds
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // in seconds
    backoffMultiplier: number;
  };
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  logs: string[];
}

const WorkflowAutomation: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'timeline'>('list');
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ['/workflows'],
  });

  const { data: executions = [] } = useQuery<WorkflowExecution[]>({
    queryKey: ['/workflow-executions'],
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      if (!response.ok) throw new Error('Failed to create workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/workflows'] });
      setShowCreateModal(false);
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Workflow>) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/workflows'] });
      setShowEditModal(false);
      setSelectedWorkflow(null);
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/workflows/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete workflow');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/workflows'] });
    },
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/workflows/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to toggle workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/workflows'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-subtle text-success';
      case 'inactive':
        return 'bg-secondary-subtle text-secondary';
      case 'draft':
        return 'bg-warning-subtle text-warning';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-success" />;
      case 'inactive':
        return <FaPause className="text-secondary" />;
      case 'draft':
        return <FaExclamationTriangle className="text-warning" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const predefinedWorkflows = [
    {
      name: 'Low Stock Alert',
      description: 'Automatically send notifications when inventory falls below threshold',
      trigger: 'inventory_low',
      conditions: [{ field: 'stock', operator: 'less_than', value: 10 }],
      actions: [{ type: 'notification', message: 'Low stock alert for {product_name}' }],
      category: 'inventory',
      tags: ['inventory', 'alerts', 'automation']
    },
    {
      name: 'Welcome New Customer',
      description: 'Send welcome email and add to loyalty program for new customers',
      trigger: 'customer_created',
      conditions: [],
      actions: [
        { type: 'email', template: 'welcome' },
        { type: 'loyalty_points', points: 100 }
      ],
      category: 'customer',
      tags: ['customer', 'onboarding', 'loyalty']
    },
    {
      name: 'Order Fulfillment',
      description: 'Automatically process orders and update inventory',
      trigger: 'order_created',
      conditions: [{ field: 'payment_status', operator: 'equals', value: 'paid' }],
      actions: [
        { type: 'update_inventory', operation: 'decrease' },
        { type: 'send_confirmation', template: 'order_confirmation' }
      ],
      category: 'orders',
      tags: ['orders', 'fulfillment', 'inventory']
    },
    {
      name: 'Abandoned Cart Recovery',
      description: 'Send follow-up emails to customers with abandoned carts',
      trigger: 'cart_abandoned',
      conditions: [{ field: 'cart_value', operator: 'greater_than', value: 50 }],
      actions: [
        { type: 'email', template: 'cart_recovery', delay: '1h' },
        { type: 'email', template: 'cart_discount', delay: '24h' }
      ],
      category: 'marketing',
      tags: ['marketing', 'cart', 'recovery']
    },
    {
      name: 'High-Value Customer VIP',
      description: 'Automatically upgrade high-spending customers to VIP status',
      trigger: 'customer_spend_threshold',
      conditions: [
        { field: 'total_spent', operator: 'greater_than', value: 1000 },
        { field: 'order_count', operator: 'greater_than', value: 5 }
      ],
      actions: [
        { type: 'update_tier', tier: 'VIP' },
        { type: 'email', template: 'vip_welcome' },
        { type: 'loyalty_points', points: 500 }
      ],
      category: 'customer',
      tags: ['customer', 'vip', 'loyalty']
    },
    {
      name: 'Weekly Sales Report',
      description: 'Generate and send weekly sales reports to management',
      trigger: 'scheduled',
      conditions: [],
      actions: [
        { type: 'generate_report', template: 'weekly_sales' },
        { type: 'email', template: 'report_delivery', recipients: ['manager@company.com'] }
      ],
      category: 'reports',
      tags: ['reports', 'scheduled', 'analytics']
    }
  ];

  const workflowTemplates = [
    {
      id: 'ecommerce-basic',
      name: 'E-commerce Basic',
      description: 'Essential workflows for online stores',
      workflows: predefinedWorkflows.slice(0, 3),
      category: 'ecommerce'
    },
    {
      id: 'customer-retention',
      name: 'Customer Retention',
      description: 'Workflows to improve customer loyalty',
      workflows: predefinedWorkflows.filter(w => w.category === 'customer'),
      category: 'marketing'
    },
    {
      id: 'inventory-management',
      name: 'Inventory Management',
      description: 'Automated inventory control workflows',
      workflows: predefinedWorkflows.filter(w => w.category === 'inventory'),
      category: 'operations'
    }
  ];

  if (isLoading) {
  return (
      <AnimatedCard>
        <div className="card-body">
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Workflow Automation</h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-1" />
            Create Workflow
          </button>
          <button 
            className="btn btn-outline-info btn-sm"
            onClick={() => setShowTemplatesModal(true)}
          >
            <FaCode className="me-1" />
            Templates
          </button>
          <button 
            className="btn btn-outline-success btn-sm"
            onClick={() => setShowAnalyticsModal(true)}
          >
            <FaChartLine className="me-1" />
            Analytics
          </button>
          <button className="btn btn-outline-secondary btn-sm">
            <FaCog className="me-1" />
            Settings
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Enhanced Controls */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="lastRun">Last Run</option>
              <option value="successRate">Success Rate</option>
            </select>
          </div>
          <div className="col-md-2">
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="h4 mb-1 text-primary">{workflows.length}</div>
              <div className="small text-muted">Total Workflows</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="h4 mb-1 text-success">
                {workflows.filter(w => w.status === 'active').length}
              </div>
              <div className="small text-muted">Active</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="h4 mb-1 text-info">
                {executions.filter(e => e.status === 'completed').length}
              </div>
              <div className="small text-muted">Executions</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="text-center p-3 bg-light rounded">
              <div className="h4 mb-1 text-warning">
                {Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length || 0)}%
              </div>
              <div className="small text-muted">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Enhanced Workflows List */}
        <div className="workflows-list">
          {workflows
            .filter(workflow => {
              const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
              const matchesPriority = filterPriority === 'all' || workflow.priority === filterPriority;
              return matchesSearch && matchesStatus && matchesPriority;
            })
            .sort((a, b) => {
              switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'status': return a.status.localeCompare(b.status);
                case 'priority': return a.priority.localeCompare(b.priority);
                case 'lastRun': return new Date(b.lastRun || 0).getTime() - new Date(a.lastRun || 0).getTime();
                case 'successRate': return b.successRate - a.successRate;
                default: return 0;
              }
            })
            .map((workflow) => (
              <div key={workflow.id} className="workflow-item border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      {getStatusIcon(workflow.status)}
                      <h6 className="mb-0 ms-2">{workflow.name}</h6>
                      <span className={`badge ${getStatusBadge(workflow.status)} ms-2`}>
                        {workflow.status}
                      </span>
                      <span className={`badge bg-${workflow.priority === 'critical' ? 'danger' : 
                                                      workflow.priority === 'high' ? 'warning' :
                                                      workflow.priority === 'medium' ? 'info' : 'secondary'} ms-2`}>
                        {workflow.priority}
                      </span>
                      {workflow.schedule && (
                        <span className="badge bg-primary ms-2">
                          <FaCalendar className="me-1" />
                          {workflow.schedule.type}
                        </span>
                      )}
                    </div>
                    <p className="text-muted small mb-2">{workflow.description}</p>
                    <div className="d-flex gap-4 small text-muted mb-2">
                      <span>Trigger: {workflow.trigger}</span>
                      <span>Runs: {workflow.runCount}</span>
                      <span>Success: {workflow.successRate}%</span>
                      {workflow.lastRun && (
                        <span>Last run: {new Date(workflow.lastRun).toLocaleDateString()}</span>
                      )}
                    </div>
                    {workflow.tags && workflow.tags.length > 0 && (
                      <div className="d-flex gap-1">
                        {workflow.tags.map((tag, index) => (
                          <span key={index} className="badge bg-light text-dark small">
                            <FaTag className="me-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setShowEditModal(true);
                      }}
                      title="Edit Workflow"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-info"
                      title="Copy Workflow"
                    >
                      <FaCopy />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => toggleWorkflowMutation.mutate({
                        id: workflow.id,
                        status: workflow.status === 'active' ? 'inactive' : 'active'
                      })}
                      title={workflow.status === 'active' ? 'Pause Workflow' : 'Activate Workflow'}
                    >
                      {workflow.status === 'active' ? <FaPause /> : <FaPlay />}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      title="View History"
                    >
                      <FaHistory />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteWorkflowMutation.mutate(workflow.id)}
                      title="Delete Workflow"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Enhanced Predefined Workflows */}
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Predefined Workflows</h6>
            <button
              className="btn btn-outline-info btn-sm"
              onClick={() => setShowTemplatesModal(true)}
            >
              <FaCode className="me-1" />
              Browse Templates
            </button>
          </div>
          <div className="row g-3">
            {predefinedWorkflows.map((template, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{template.name}</h6>
                      <span className="badge bg-secondary small">{template.category}</span>
                    </div>
                    <p className="card-text small text-muted mb-3">{template.description}</p>
                    {template.tags && (
                      <div className="mb-3">
                        {template.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="badge bg-light text-dark small me-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                        onClick={() => {
                          createWorkflowMutation.mutate({
                            ...template,
                            status: 'draft'
                          });
                        }}
                      >
                        <FaPlus className="me-1" />
                        Add Workflow
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        title="Preview Workflow"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Workflow</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createWorkflowMutation.mutate({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    trigger: formData.get('trigger') as string,
                    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'critical',
                    tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag),
                    status: 'draft'
                  });
                }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Workflow Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Priority</label>
                      <select className="form-select" name="priority" required>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows={3}
                    ></textarea>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Trigger</label>
                      <select className="form-select" name="trigger" required>
                        <option value="">Select trigger</option>
                        <option value="inventory_low">Low Inventory</option>
                        <option value="customer_created">New Customer</option>
                        <option value="order_created">New Order</option>
                        <option value="payment_received">Payment Received</option>
                        <option value="cart_abandoned">Cart Abandoned</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="custom">Custom Event</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tags (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="tags"
                        placeholder="e.g., inventory, alerts, automation"
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Create Workflow
                          </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                          </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Workflow Templates</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowTemplatesModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {workflowTemplates.map((template) => (
                    <div key={template.id} className="col-md-6">
                      <div className="card h-100">
                        <div className="card-header">
                          <h6 className="mb-0">{template.name}</h6>
                          <small className="text-muted">{template.description}</small>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <strong>Included Workflows:</strong>
                            <ul className="list-unstyled mt-2">
                              {template.workflows.map((workflow, index) => (
                                <li key={index} className="small text-muted">
                                  • {workflow.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              template.workflows.forEach(workflow => {
                                createWorkflowMutation.mutate({
                                  ...workflow,
                                  status: 'draft'
                                });
                              });
                              setShowTemplatesModal(false);
                            }}
                          >
                            <FaDownload className="me-1" />
                            Import Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Workflow Analytics</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAnalyticsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Execution Trends</h6>
                      </div>
                      <div className="card-body">
                        <div className="text-center py-4">
                          <FaChartLine size={48} className="text-muted mb-3" />
                          <p className="text-muted">Execution trends chart would be displayed here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Success Rate by Workflow</h6>
                      </div>
                      <div className="card-body">
                        <div className="text-center py-4">
                          <FaChartLine size={48} className="text-muted mb-3" />
                          <p className="text-muted">Success rate chart would be displayed here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
};

export default WorkflowAutomation;