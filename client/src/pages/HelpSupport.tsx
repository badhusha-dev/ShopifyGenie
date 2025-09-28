import React, { useState } from 'react';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Video, 
  BookOpen, 
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Download,
  Star,
  Clock,
  Users,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const HelpSupport: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'inventory', name: 'Inventory Management', icon: FileText },
    { id: 'customers', name: 'Customer Management', icon: Users },
    { id: 'billing', name: 'Billing & Payments', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I get started with ShopifyGenie?',
      answer: 'Getting started is easy! First, create your account, then connect your Shopify store (optional), and start managing your inventory, customers, and orders. Check out our quick start guide for detailed steps.',
      helpful: 95,
      tags: ['setup', 'getting-started', 'basics']
    },
    {
      id: 2,
      category: 'inventory',
      question: 'How do I manage my inventory?',
      answer: 'Use the Inventory Management page to add products, track stock levels, set up low stock alerts, and manage product variants. You can also bulk import products from CSV files.',
      helpful: 87,
      tags: ['inventory', 'products', 'stock']
    },
    {
      id: 3,
      category: 'customers',
      question: 'How do I set up customer loyalty programs?',
      answer: 'Navigate to the Loyalty Program page to configure points, tiers, and rewards. You can set up automatic point accrual based on purchases and create custom reward tiers.',
      helpful: 92,
      tags: ['loyalty', 'customers', 'rewards']
    },
    {
      id: 4,
      category: 'integrations',
      question: 'Can I integrate with other platforms?',
      answer: 'Yes! ShopifyGenie supports integrations with Shopify, payment processors, shipping providers, and more. Check the Integrations page for available connections.',
      helpful: 78,
      tags: ['integrations', 'shopify', 'api']
    },
    {
      id: 5,
      category: 'billing',
      question: 'How does billing work?',
      answer: 'Billing is handled through your connected payment methods. You can view invoices, payment history, and manage subscriptions in the Billing section of System Settings.',
      helpful: 83,
      tags: ['billing', 'payments', 'invoices']
    },
    {
      id: 6,
      category: 'troubleshooting',
      question: 'Why can\'t I see my data after connecting Shopify?',
      answer: 'Data sync may take a few minutes. Check your connection status in System Settings > Shopify Integration. If issues persist, try disconnecting and reconnecting your store.',
      helpful: 89,
      tags: ['troubleshooting', 'shopify', 'sync']
    }
  ];

  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in minutes',
      icon: Zap,
      duration: '5 min read',
      category: 'getting-started'
    },
    {
      title: 'Inventory Management',
      description: 'Complete guide to managing your products',
      icon: FileText,
      duration: '12 min read',
      category: 'inventory'
    },
    {
      title: 'Customer Loyalty Setup',
      description: 'Set up and configure loyalty programs',
      icon: Users,
      duration: '8 min read',
      category: 'customers'
    },
    {
      title: 'Shopify Integration',
      description: 'Connect and sync with Shopify',
      icon: Globe,
      duration: '10 min read',
      category: 'integrations'
    },
    {
      title: 'Advanced Analytics',
      description: 'Understanding your business metrics',
      icon: Star,
      duration: '15 min read',
      category: 'getting-started'
    },
    {
      title: 'API Documentation',
      description: 'Developer resources and API guides',
      icon: BookOpen,
      duration: '20 min read',
      category: 'integrations'
    }
  ];

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: '24/7',
      responseTime: '< 2 minutes',
      action: 'Start Chat'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: '24/7',
      responseTime: '< 4 hours',
      action: 'Send Email'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: Phone,
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Immediate',
      action: 'Call Now'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredGuides = guides.filter(guide => 
    selectedCategory === 'all' || guide.category === selectedCategory
  );

  return (
    <div className="help-support-page">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4 position-relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white'
          }}>
            <div className="welcome-background"></div>
            <div className="d-flex align-items-center position-relative">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 floating"
                  style={{width: '60px', height: '60px'}}
                >
                  <HelpCircle size={24} className="text-white" />
                </div>
              </div>
              <div className="flex-grow-1">
                <h1 className="h2 fw-bold mb-1 fade-in">Help & Support Center</h1>
                <p className="mb-0 text-white-50 slide-in-left">
                  Find answers, get help, and learn how to make the most of ShopifyGenie
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex align-items-center mb-3">
              <Search className="me-2 text-primary" size={20} />
              <h5 className="fw-bold mb-0">Search Help Center</h5>
            </div>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search for help articles, guides, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="button">
                <Search size={16} />
              </button>
            </div>
            <div className="mt-3">
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-light text-dark">Popular:</span>
                {['getting started', 'inventory', 'shopify integration', 'loyalty program', 'billing'].map(tag => (
                  <button
                    key={tag}
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <h5 className="fw-bold mb-3">Browse by Category</h5>
            <div className="row g-3">
              {categories.map(category => (
                <div key={category.id} className="col-lg-3 col-md-4 col-sm-6">
                  <button
                    className={`btn w-100 p-3 text-start d-flex align-items-center ${
                      selectedCategory === category.id ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="me-3" size={20} />
                    <span className="fw-semibold">{category.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Help Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <h5 className="fw-bold mb-3">Get Help Fast</h5>
            <div className="row g-3">
              {contactMethods.map((method, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm hover-lift">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center mx-auto"
                          style={{
                            width: '48px', 
                            height: '48px',
                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                          }}
                        >
                          <method.icon className="text-white" size={20} />
                        </div>
                      </div>
                      <h6 className="fw-bold mb-2">{method.title}</h6>
                      <p className="text-muted small mb-3">{method.description}</p>
                      <div className="small text-muted mb-3">
                        <div><Clock size={14} className="me-1" /> {method.availability}</div>
                        <div>Response: {method.responseTime}</div>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm w-100"
                        onClick={() => setShowContactForm(true)}
                      >
                        {method.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Guides */}
      {filteredGuides.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Help Guides</h5>
                <button className="btn btn-sm btn-outline-primary">
                  View All Guides
                  <ExternalLink size={14} className="ms-1" />
                </button>
              </div>
              <div className="row g-3">
                {filteredGuides.map((guide, index) => (
                  <div key={index} className="col-lg-4 col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-lift">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-start mb-3">
                          <div 
                            className="rounded d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: '40px', 
                              height: '40px',
                              background: 'linear-gradient(135deg, var(--accent-success), var(--accent-success-dark))'
                            }}
                          >
                            <guide.icon className="text-white" size={18} />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{guide.title}</h6>
                            <p className="text-muted small mb-0">{guide.duration}</p>
                          </div>
                        </div>
                        <p className="text-muted small mb-3">{guide.description}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <button className="btn btn-sm btn-outline-primary">
                            Read Guide
                            <ChevronRight size={14} className="ms-1" />
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <Download size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                Frequently Asked Questions
                <span className="badge bg-primary ms-2">{filteredFaqs.length}</span>
              </h5>
            </div>
            <div className="accordion" id="faqAccordion">
              {filteredFaqs.map((faq, index) => (
                <div key={faq.id} className="accordion-item border-0 mb-2">
                  <h6 className="accordion-header">
                    <button
                      className="accordion-button collapsed bg-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#faq-${faq.id}`}
                      aria-expanded="false"
                      aria-controls={`faq-${faq.id}`}
                    >
                      <div className="d-flex align-items-center w-100">
                        <span className="fw-semibold me-auto">{faq.question}</span>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            <Star size={14} className="text-warning me-1" />
                            <span className="small text-muted">{faq.helpful}% helpful</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </h6>
                  <div
                    id={`faq-${faq.id}`}
                    className="accordion-collapse collapse"
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body">
                      <p className="mb-3">{faq.answer}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          {faq.tags.map(tag => (
                            <span key={tag} className="badge bg-secondary-subtle text-secondary">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-success">
                            <Star size={14} className="me-1" />
                            Helpful
                          </button>
                          <button className="btn btn-sm btn-outline-primary">
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredFaqs.length === 0 && (
              <div className="text-center py-5">
                <HelpCircle size={48} className="text-muted mb-3" />
                <h6 className="text-muted">No FAQs found</h6>
                <p className="text-muted small">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Support</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowContactForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input type="text" className="form-control" />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Priority</label>
                      <select className="form-select">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message</label>
                      <textarea className="form-control" rows={5}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Attachments</label>
                      <input type="file" className="form-control" multiple />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowContactForm(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="row">
        <div className="col-12">
          <div className="modern-card p-4 text-center">
            <h6 className="fw-bold mb-2">Still need help?</h6>
            <p className="text-muted mb-3">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-primary"
                onClick={() => setShowContactForm(true)}
              >
                <MessageCircle size={16} className="me-2" />
                Contact Support
              </button>
              <button className="btn btn-outline-primary">
                <ExternalLink size={16} className="me-2" />
                Visit Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
