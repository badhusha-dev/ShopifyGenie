import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Settings, 
  Minimize2, 
  Maximize2,
  MessageSquare,
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  context?: any;
}

interface AIChatAssistantProps {
  className?: string;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI business assistant. How can I help you today?',
      timestamp: new Date(),
      suggestions: [
        'Show me today\'s sales performance',
        'What are my low stock alerts?',
        'Generate a customer report',
        'Help me optimize inventory'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        context: aiResponse.context
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('sales') || input.includes('revenue')) {
      return {
        content: 'Based on your current data, your sales performance shows:\n\n• Total Revenue: $24,567 (+12.5% vs last period)\n• Orders Processed: 3,456 (+15.3%)\n• Conversion Rate: 3.2% (needs attention)\n\nWould you like me to analyze specific time periods or product categories?',
        suggestions: [
          'Show sales by product category',
          'Analyze conversion rate trends',
          'Compare with last month',
          'Generate sales forecast'
        ],
        context: { type: 'sales', data: { revenue: 24567, growth: 12.5 } }
      };
    }
    
    if (input.includes('stock') || input.includes('inventory')) {
      return {
        content: 'Your inventory status:\n\n⚠️ Low Stock Alerts: 5 products\n• Organic Green Tea: 12 units left\n• Premium Coffee: 8 units left\n• Chamomile Tea: 15 units left\n\n📈 Top Moving Items:\n• Herbal Tea Blend: +23% growth\n• Organic Green Tea: +15% growth\n\nWould you like me to create purchase orders or analyze demand patterns?',
        suggestions: [
          'Create purchase orders',
          'Analyze demand patterns',
          'Set up automatic reordering',
          'View inventory reports'
        ],
        context: { type: 'inventory', alerts: 5 }
      };
    }
    
    if (input.includes('customer') || input.includes('loyalty')) {
      return {
        content: 'Customer insights:\n\n👥 Active Customers: 1,247 (+8.2% this month)\n\n🏆 Loyalty Tiers:\n• Gold: 156 customers\n• Silver: 342 customers\n• Bronze: 749 customers\n\n💡 Recommendations:\n• Focus on Bronze to Silver conversion\n• Consider targeted promotions\n• Implement referral program',
        suggestions: [
          'Create customer segments',
          'Design loyalty campaigns',
          'Analyze customer lifetime value',
          'Set up automated emails'
        ],
        context: { type: 'customers', total: 1247 }
      };
    }
    
    if (input.includes('report') || input.includes('analytics')) {
      return {
        content: 'I can generate comprehensive reports for you:\n\n📊 Available Reports:\n• Sales Performance Analysis\n• Customer Behavior Insights\n• Inventory Optimization Report\n• Financial Health Dashboard\n• Marketing Effectiveness Report\n\nWhich type of report would you like me to create?',
        suggestions: [
          'Generate sales report',
          'Create customer insights',
          'Build inventory report',
          'Design financial dashboard'
        ],
        context: { type: 'reports' }
      };
    }
    
    if (input.includes('help') || input.includes('how')) {
      return {
        content: 'I can help you with:\n\n🎯 Business Analytics:\n• Sales performance tracking\n• Customer behavior analysis\n• Inventory optimization\n• Financial reporting\n\n🚀 Automation:\n• Smart alerts and notifications\n• Automated workflows\n• Predictive analytics\n• Performance optimization\n\nWhat would you like to explore?',
        suggestions: [
          'Show me available features',
          'Help with setup',
          'Explain analytics',
          'Optimize my workflow'
        ],
        context: { type: 'help' }
      };
    }
    
    // Default response
    return {
      content: 'I understand you\'re asking about: "' + userInput + '"\n\nI can help you with sales analytics, inventory management, customer insights, and business optimization. Could you be more specific about what you\'d like to know?',
      suggestions: [
        'Show sales dashboard',
        'Check inventory status',
        'Analyze customers',
        'Generate reports'
      ],
      context: { type: 'general' }
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Chat cleared! How can I help you today?',
        timestamp: new Date(),
        suggestions: [
          'Show me today\'s performance',
          'What are my alerts?',
          'Generate a report',
          'Help me optimize'
        ]
      }
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`ai-chat-assistant ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          className="ai-chat-toggle"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
          <span className="ai-chat-badge">AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`ai-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Chat Header */}
          <div className="ai-chat-header">
            <div className="d-flex align-items-center">
              <div className="ai-avatar me-3">
                <Bot size={20} className="text-primary" />
              </div>
              <div>
                <h6 className="fw-bold mb-0">AI Business Assistant</h6>
                <small className="text-muted">Always here to help</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={clearChat}
              >
                <Trash2 size={16} />
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="ai-chat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`ai-message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
                  >
                    <div className="ai-message-content">
                      <div className="ai-message-header">
                        {message.type === 'assistant' ? (
                          <Bot size={16} className="text-primary me-2" />
                        ) : (
                          <User size={16} className="text-secondary me-2" />
                        )}
                        <span className="fw-semibold small">
                          {message.type === 'assistant' ? 'AI Assistant' : 'You'}
                        </span>
                        <span className="text-muted small ms-2">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <div className="ai-message-text">
                        {message.content.split('\n').map((line, index) => (
                          <p key={index} className="mb-2">
                            {line}
                          </p>
                        ))}
                      </div>
                      
                      {/* Message Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="ai-suggestions mt-3">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="btn btn-sm btn-outline-primary me-2 mb-2"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="ai-message assistant-message">
                    <div className="ai-message-content">
                      <div className="ai-message-header">
                        <Bot size={16} className="text-primary me-2" />
                        <span className="fw-semibold small">AI Assistant</span>
                      </div>
                      <div className="ai-typing">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="ms-2 text-muted small">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="ai-chat-input">
                <div className="input-group">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control"
                    placeholder="Ask me anything about your business..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="ai-chat-footer">
                  <small className="text-muted">
                    <Sparkles size={12} className="me-1" />
                    Powered by AI • Ask about sales, inventory, customers, or reports
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
