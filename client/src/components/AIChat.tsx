import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaRobot, FaPaperPlane, FaLightbulb, FaTimes } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
}

interface AIResponse {
  response: string;
  suggestions: string[];
  contextualSuggestions?: string[];
  confidence?: number;
  timestamp: string;
  context?: {
    businessType: string;
    industry: string;
    scale: string;
  };
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!response.ok) throw new Error('Failed to get AI response');
      return response.json();
    },
    onSuccess: (data: AIResponse) => {
      const newMessages: ChatMessage[] = [
        {
          id: Date.now().toString(),
          message: message,
          isUser: true,
          timestamp: new Date().toISOString(),
        },
        {
          id: (Date.now() + 1).toString(),
          message: data.response,
          isUser: false,
          timestamp: data.timestamp,
        },
      ];
      setChatHistory(prev => [...prev, ...newMessages]);
      setMessage('');
      
      // Store AI response data for suggestions
      if (data.suggestions) {
        // You could store this in state or context for later use
        console.log('AI Suggestions:', data.suggestions);
      }
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !chatMutation.isPending) {
      chatMutation.mutate(message.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="ai-chat-toggle">
        <button
          className="btn btn-primary btn-floating"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <FaRobot size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="ai-chat-widget" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '500px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <AnimatedCard className="h-100 d-flex flex-column">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FaRobot className="text-primary me-2" />
            <h6 className="mb-0">AI Assistant</h6>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="card-body flex-grow-1 d-flex flex-column">
          <div className="chat-messages flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '300px' }}>
            {chatHistory.length === 0 ? (
              <div className="text-center text-muted py-4">
                <FaRobot size={48} className="mb-3 opacity-50" />
                <p>Hi! I'm your AI assistant. How can I help you today?</p>
                <div className="suggestions">
                  <h6 className="mb-2">Try asking:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {['Show me sales trends', 'What products need restocking?', 'How are my customers performing?', 'Generate a revenue report', 'Analyze my marketing performance', 'What are my growth opportunities?'].map((suggestion, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`message mb-2 ${msg.isUser ? 'text-end' : 'text-start'}`}>
                  <div className={`d-inline-block p-2 rounded ${msg.isUser ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '80%' }}>
                    <div className="message-text">{msg.message}</div>
                    <small className={`message-time ${msg.isUser ? 'text-white-50' : 'text-muted'}`}>
                      {formatTime(msg.timestamp)}
                    </small>
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="message mb-2 text-start">
                <div className="d-inline-block p-2 rounded bg-light">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="text-muted">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ask me anything about your business..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={chatMutation.isPending}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!message.trim() || chatMutation.isPending}
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AIChat;
