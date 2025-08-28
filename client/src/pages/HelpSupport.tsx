
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FaQuestionCircle, FaTicketAlt, FaEnvelope, FaPhone, FaChevronDown, FaChevronUp, FaBook, FaPlay, FaPaperPlane } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';

// Form Schema
const supportTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.enum(['general', 'technical', 'billing', 'feature-request']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportTicketData = z.infer<typeof supportTicketSchema>;

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

const HelpSupport = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'tickets'>('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const queryClient = useQueryClient();

  // Fetch data
  const { data: faqs = [] } = useQuery<FAQ[]>({
    queryKey: ['/api/support/faqs'],
  });

  const { data: tickets = [] } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (data: SupportTicketData) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create support ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      alert('Support ticket created successfully! We will respond within 24 hours.');
      reset();
    },
  });

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupportTicketData>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      category: 'general',
      priority: 'medium',
    },
  });

  const onSubmit = (data: SupportTicketData) => {
    createTicketMutation.mutate(data);
  };

  // Mock data for demo
  const mockFAQs: FAQ[] = [
    {
      id: '1',
      category: 'general',
      question: 'How do I get started with Shopify Gennie?',
      answer: 'Getting started is easy! First, create your account and complete the onboarding process. Then, set up your inventory, configure your payment methods, and start processing orders. Check out our getting started guide for detailed instructions.',
    },
    {
      id: '2',
      category: 'technical',
      question: 'Can I integrate Shopify Gennie with my existing systems?',
      answer: 'Yes! Shopify Gennie offers robust API integrations and supports popular platforms like Shopify, WooCommerce, Stripe, PayPal, and more. Visit the Integrations page to set up your connections.',
    },
    {
      id: '3',
      category: 'billing',
      question: 'Can I change my plan at any time?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time from the Billing & Plans page. Changes take effect immediately for upgrades, and at the end of your billing cycle for downgrades.',
    },
    {
      id: '4',
      category: 'technical',
      question: 'Is my data secure?',
      answer: 'Yes, we take security very seriously. All data is encrypted in transit and at rest, we use industry-standard security practices, and our infrastructure is SOC 2 compliant. We also perform regular security audits.',
    },
    {
      id: '5',
      category: 'general',
      question: 'Do you offer customer support?',
      answer: 'Yes! We offer email support for all plans, priority support for Pro and Growth plans, and 24/7 phone support for Enterprise customers. You can also access our comprehensive documentation and video tutorials.',
    },
    {
      id: '6',
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers. All payments are processed securely through Stripe.',
    },
  ];

  const mockTickets: SupportTicket[] = [
    {
      id: 'ticket_001',
      subject: 'Issue with inventory sync',
      category: 'technical',
      priority: 'high',
      status: 'in-progress',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
    },
    {
      id: 'ticket_002',
      subject: 'Question about billing',
      category: 'billing',
      priority: 'medium',
      status: 'resolved',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-11',
    },
  ];

  const currentFAQs = faqs.length > 0 ? faqs : mockFAQs;
  const currentTickets = tickets.length > 0 ? tickets : mockTickets;

  const filteredFAQs = selectedCategory === 'all' 
    ? currentFAQs 
    : currentFAQs.filter(faq => faq.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(currentFAQs.map(faq => faq.category)))];

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-primary',
      'in-progress': 'bg-warning',
      resolved: 'bg-success',
      closed: 'bg-secondary',
    };
    return <span className={`badge ${badges[status as keyof typeof badges]}`}>{status}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-info',
      medium: 'bg-warning',
      high: 'bg-danger',
      urgent: 'bg-dark',
    };
    return <span className={`badge ${badges[priority as keyof typeof badges]}`}>{priority}</span>;
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark fw-bold" style={{ color: designTokens.colors.shopify.green }}>
            <FaQuestionCircle className="me-2" />
            Help & Support
          </h2>
          <p className="text-muted mb-0">Get help, find answers, and contact our support team</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
            type="button"
          >
            <FaQuestionCircle className="me-2" />
            FAQ
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
            type="button"
          >
            <FaEnvelope className="me-2" />
            Contact Support
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
            type="button"
          >
            <FaTicketAlt className="me-2" />
            My Tickets
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div>
            {/* Quick Links */}
            <div className="row g-4 mb-4">
              <div className="col-lg-4">
                <AnimatedCard className="border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <FaBook className="display-4 text-primary mb-3" />
                    <h5>Documentation</h5>
                    <p className="text-muted">Comprehensive guides and API documentation</p>
                    <a href="#" className="btn btn-outline-primary">
                      View Docs
                    </a>
                  </div>
                </AnimatedCard>
              </div>
              <div className="col-lg-4">
                <AnimatedCard className="border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <FaPlay className="display-4 text-success mb-3" />
                    <h5>Video Tutorials</h5>
                    <p className="text-muted">Step-by-step video guides and walkthroughs</p>
                    <a href="#" className="btn btn-outline-success">
                      Watch Videos
                    </a>
                  </div>
                </AnimatedCard>
              </div>
              <div className="col-lg-4">
                <AnimatedCard className="border-0 shadow-sm h-100 text-center">
                  <div className="card-body p-4">
                    <FaPhone className="display-4 text-info mb-3" />
                    <h5>Phone Support</h5>
                    <p className="text-muted">24/7 support for Enterprise customers</p>
                    <a href="tel:+1234567890" className="btn btn-outline-info">
                      Call Now
                    </a>
                  </div>
                </AnimatedCard>
              </div>
            </div>

            {/* FAQ Section */}
            <AnimatedCard className="border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Frequently Asked Questions</h5>
                  <select
                    className="form-select w-auto"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="accordion">
                  {filteredFAQs.map((faq, index) => (
                    <div key={faq.id} className="accordion-item border-0 border-bottom">
                      <h2 className="accordion-header">
                        <button
                          className="accordion-button collapsed bg-transparent"
                          type="button"
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        >
                          <span className="fw-semibold">{faq.question}</span>
                          {expandedFAQ === faq.id ? <FaChevronUp className="ms-auto" /> : <FaChevronDown className="ms-auto" />}
                        </button>
                      </h2>
                      {expandedFAQ === faq.id && (
                        <div className="accordion-body">
                          <p className="mb-0 text-muted">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <AnimatedCard className="border-0 shadow-sm">
                <div className="card-body p-4">
                  <h5 className="card-title mb-4">Contact Support</h5>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Category *</label>
                        <select
                          className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                          {...register('category')}
                        >
                          <option value="general">General Question</option>
                          <option value="technical">Technical Issue</option>
                          <option value="billing">Billing & Account</option>
                          <option value="feature-request">Feature Request</option>
                        </select>
                        {errors.category && (
                          <div className="invalid-feedback">{errors.category.message}</div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Priority *</label>
                        <select
                          className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                          {...register('priority')}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        {errors.priority && (
                          <div className="invalid-feedback">{errors.priority.message}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Subject *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                        placeholder="Brief description of your issue"
                        {...register('subject')}
                      />
                      {errors.subject && (
                        <div className="invalid-feedback">{errors.subject.message}</div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Message *</label>
                      <textarea
                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                        rows={6}
                        placeholder="Please provide detailed information about your issue or question"
                        {...register('message')}
                      />
                      {errors.message && (
                        <div className="invalid-feedback">{errors.message.message}</div>
                      )}
                    </div>

                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={createTicketMutation.isPending}
                      >
                        <FaPaperPlane className="me-2" />
                        {createTicketMutation.isPending ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
              </AnimatedCard>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <AnimatedCard className="border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0">My Support Tickets</h5>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('contact')}
                >
                  <FaTicketAlt className="me-2" />
                  New Ticket
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="fw-semibold">{ticket.subject}</td>
                        <td>
                          <span className="badge bg-secondary">
                            {ticket.category}
                          </span>
                        </td>
                        <td>{getPriorityBadge(ticket.priority)}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {currentTickets.length === 0 && (
                <div className="text-center py-4">
                  <FaTicketAlt className="display-4 text-muted mb-3" />
                  <h5 className="text-muted">No support tickets found</h5>
                  <p className="text-muted">Create your first support ticket to get help from our team.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab('contact')}
                  >
                    Create Ticket
                  </button>
                </div>
              )}
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default HelpSupport;
