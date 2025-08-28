
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaCreditCard, FaCheck, FaTimes, FaCrown, FaRocket, FaBuilding, FaDownload } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
  limits: {
    orders: number;
    storage: string;
    apiCalls: number;
    users: number;
  };
  popular?: boolean;
}

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    ordersProcessed: number;
    storageUsed: string;
    apiCallsUsed: number;
    usersActive: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  downloadUrl: string;
}

const BillingPlans = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'plans' | 'subscription' | 'billing'>('plans');

  const queryClient = useQueryClient();

  // Fetch data
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/billing/plans', billingCycle],
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/billing/subscription'],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/billing/invoices'],
  });

  // Mutations
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing: billingCycle }),
      });
      if (!response.ok) throw new Error('Failed to subscribe');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      alert('Subscription updated successfully!');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/billing/subscription/cancel', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to cancel subscription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
      alert('Subscription will be canceled at the end of the current period.');
    },
  });

  // Mock data for demo
  const mockPlans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      billing: billingCycle,
      features: [
        'Up to 100 orders/month',
        '1GB storage',
        '1,000 API calls/month',
        '1 user',
        'Basic support',
      ],
      limits: {
        orders: 100,
        storage: '1GB',
        apiCalls: 1000,
        users: 1,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing businesses',
      price: billingCycle === 'monthly' ? 29 : 290,
      billing: billingCycle,
      features: [
        'Up to 1,000 orders/month',
        '10GB storage',
        '10,000 API calls/month',
        '5 users',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
      ],
      limits: {
        orders: 1000,
        storage: '10GB',
        apiCalls: 10000,
        users: 5,
      },
      popular: true,
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For scaling operations',
      price: billingCycle === 'monthly' ? 99 : 990,
      billing: billingCycle,
      features: [
        'Up to 10,000 orders/month',
        '100GB storage',
        '100,000 API calls/month',
        '25 users',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Multi-location support',
        'Advanced reporting',
      ],
      limits: {
        orders: 10000,
        storage: '100GB',
        apiCalls: 100000,
        users: 25,
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      price: billingCycle === 'monthly' ? 299 : 2990,
      billing: billingCycle,
      features: [
        'Unlimited orders',
        '1TB storage',
        'Unlimited API calls',
        'Unlimited users',
        '24/7 phone support',
        'Advanced analytics',
        'Custom branding',
        'Multi-location support',
        'Advanced reporting',
        'Custom integrations',
        'Dedicated account manager',
      ],
      limits: {
        orders: -1, // Unlimited
        storage: '1TB',
        apiCalls: -1,
        users: -1,
      },
    },
  ];

  const mockSubscription: Subscription = {
    id: 'sub_123',
    planId: 'pro',
    planName: 'Pro',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    cancelAtPeriodEnd: false,
    usage: {
      ordersProcessed: 245,
      storageUsed: '2.5GB',
      apiCallsUsed: 3250,
      usersActive: 3,
    },
  };

  const mockInvoices: Invoice[] = [
    {
      id: 'inv_001',
      amount: 29.00,
      status: 'paid',
      date: '2024-01-01',
      downloadUrl: '/api/billing/invoices/inv_001/download',
    },
    {
      id: 'inv_002',
      amount: 29.00,
      status: 'paid',
      date: '2023-12-01',
      downloadUrl: '/api/billing/invoices/inv_002/download',
    },
  ];

  const currentPlans = plans.length > 0 ? plans : mockPlans;
  const currentSubscription = subscription || mockSubscription;
  const currentInvoices = invoices.length > 0 ? invoices : mockInvoices;

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro':
        return <FaRocket className="text-primary" />;
      case 'growth':
        return <FaCrown className="text-warning" />;
      case 'enterprise':
        return <FaBuilding className="text-danger" />;
      default:
        return <FaCheck className="text-success" />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark fw-bold" style={{ color: designTokens.colors.shopify.green }}>
            <FaCreditCard className="me-2" />
            Billing & Plans
          </h2>
          <p className="text-muted mb-0">Manage your subscription and billing information</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('plans')}
            type="button"
          >
            Plans & Pricing
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
            type="button"
          >
            Current Subscription
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
            type="button"
          >
            Billing History
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Plans & Pricing Tab */}
        {activeTab === 'plans' && (
          <div>
            {/* Billing Cycle Toggle */}
            <div className="text-center mb-4">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`btn ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                  <span className="badge bg-success ms-2">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="row g-4">
              {currentPlans.map((plan) => (
                <div key={plan.id} className="col-lg-3 col-md-6">
                  <AnimatedCard className={`h-100 position-relative ${plan.popular ? 'border-primary' : 'border-0 shadow-sm'}`}>
                    {plan.popular && (
                      <div className="position-absolute top-0 start-50 translate-middle">
                        <span className="badge bg-primary px-3 py-2">Most Popular</span>
                      </div>
                    )}
                    <div className="card-body p-4 text-center">
                      <div className="mb-3">
                        {getPlanIcon(plan.id)}
                      </div>
                      <h4 className="card-title fw-bold">{plan.name}</h4>
                      <p className="text-muted mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        <div className="display-4 fw-bold text-primary">
                          {formatPrice(plan.price)}
                        </div>
                        {plan.price > 0 && (
                          <small className="text-muted">
                            per {billingCycle === 'monthly' ? 'month' : 'year'}
                          </small>
                        )}
                      </div>

                      <ul className="list-unstyled text-start mb-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="mb-2">
                            <FaCheck className="text-success me-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`btn w-100 ${
                          currentSubscription?.planId === plan.id
                            ? 'btn-success disabled'
                            : plan.popular
                            ? 'btn-primary'
                            : 'btn-outline-primary'
                        }`}
                        onClick={() => subscribeMutation.mutate(plan.id)}
                        disabled={
                          subscribeMutation.isPending ||
                          currentSubscription?.planId === plan.id
                        }
                      >
                        {currentSubscription?.planId === plan.id
                          ? 'Current Plan'
                          : subscribeMutation.isPending
                          ? 'Processing...'
                          : plan.price === 0
                          ? 'Get Started'
                          : 'Upgrade Now'
                        }
                      </button>
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="row">
            <div className="col-lg-8">
              <AnimatedCard className="border-0 shadow-sm mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h5 className="card-title mb-1">Current Plan: {currentSubscription.planName}</h5>
                      <span className={`badge ${
                        currentSubscription.status === 'active' ? 'bg-success' :
                        currentSubscription.status === 'trialing' ? 'bg-info' :
                        currentSubscription.status === 'past_due' ? 'bg-warning' :
                        'bg-danger'
                      }`}>
                        {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="small text-muted">Next billing</div>
                      <div className="fw-bold">{new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <h6 className="mb-3">Usage This Period</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Orders Processed</span>
                          <span className="fw-bold">
                            {currentSubscription.usage.ordersProcessed}
                            {currentPlans.find(p => p.id === currentSubscription.planId)?.limits.orders !== -1 && 
                              ` / ${currentPlans.find(p => p.id === currentSubscription.planId)?.limits.orders}`
                            }
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{
                              width: `${getUsagePercentage(
                                currentSubscription.usage.ordersProcessed,
                                currentPlans.find(p => p.id === currentSubscription.planId)?.limits.orders || 0
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Storage Used</span>
                          <span className="fw-bold">
                            {currentSubscription.usage.storageUsed} / {currentPlans.find(p => p.id === currentSubscription.planId)?.limits.storage}
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-info"
                            style={{ width: '25%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>API Calls</span>
                          <span className="fw-bold">
                            {currentSubscription.usage.apiCallsUsed}
                            {currentPlans.find(p => p.id === currentSubscription.planId)?.limits.apiCalls !== -1 && 
                              ` / ${currentPlans.find(p => p.id === currentSubscription.planId)?.limits.apiCalls}`
                            }
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: `${getUsagePercentage(
                                currentSubscription.usage.apiCallsUsed,
                                currentPlans.find(p => p.id === currentSubscription.planId)?.limits.apiCalls || 0
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Active Users</span>
                          <span className="fw-bold">
                            {currentSubscription.usage.usersActive}
                            {currentPlans.find(p => p.id === currentSubscription.planId)?.limits.users !== -1 && 
                              ` / ${currentPlans.find(p => p.id === currentSubscription.planId)?.limits.users}`
                            }
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: `${getUsagePercentage(
                                currentSubscription.usage.usersActive,
                                currentPlans.find(p => p.id === currentSubscription.planId)?.limits.users || 0
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Subscription Actions */}
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title mb-3">Subscription Actions</h5>
                  <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={() => setActiveTab('plans')}>
                      Upgrade Plan
                    </button>
                    {!currentSubscription.cancelAtPeriodEnd && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => cancelSubscriptionMutation.mutate()}
                        disabled={cancelSubscriptionMutation.isPending}
                      >
                        {cancelSubscriptionMutation.isPending ? 'Processing...' : 'Cancel Subscription'}
                      </button>
                    )}
                    {currentSubscription.cancelAtPeriodEnd && (
                      <div className="alert alert-warning mb-0">
                        Your subscription will be canceled at the end of the current period.
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === 'billing' && (
          <div className="row">
            <div className="col-12">
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">Billing History</h5>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentInvoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td>{new Date(invoice.date).toLocaleDateString()}</td>
                            <td className="fw-bold">${invoice.amount.toFixed(2)}</td>
                            <td>
                              <span className={`badge ${
                                invoice.status === 'paid' ? 'bg-success' :
                                invoice.status === 'pending' ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {invoice.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(invoice.downloadUrl, '_blank')}
                              >
                                <FaDownload className="me-1" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPlans;
