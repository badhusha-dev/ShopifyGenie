import React from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'shopify' | 'blue' | 'purple' | 'coral' | 'none';
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = 'none',
  onClick 
}) => {
  const gradientClasses = {
    shopify: 'card-gradient-shopify',
    blue: 'card-gradient-blue',
    purple: 'card-gradient-purple',
    coral: 'card-gradient-coral',
    none: ''
  };

  return (
    <>
      <div 
        className={`animated-card modern-card ${hover ? 'card-hover' : ''} ${gradientClasses[gradient]} ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {children}
      </div>

      {/* Embedded styles for animations */}
      <style jsx>{`
        .animated-card {
          transition: all 0.3s ease;
          border: 1px solid #e0e6ed;
          border-radius: 12px;
          background: white;
          overflow: hidden;
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
          border-color: var(--shopify-green);
        }

        .card-gradient-shopify {
          background: linear-gradient(135deg, var(--shopify-green-light) 0%, var(--shopify-green) 100%);
          color: white;
          border-color: var(--shopify-green);
        }

        .card-gradient-blue {
          background: linear-gradient(135deg, #e3f2fd 0%, #2196f3 100%);
          color: white;
          border-color: #2196f3;
        }

        .card-gradient-purple {
          background: linear-gradient(135deg, #f3e5f5 0%, #9c27b0 100%);
          color: white;
          border-color: #9c27b0;
        }

        .card-gradient-coral {
          background: linear-gradient(135deg, var(--coral-light) 0%, var(--coral-accent) 100%);
          color: white;
          border-color: var(--coral-accent);
        }

        .card-hover:hover .card-content {
          transform: scale(1.02);
        }

        .card-content {
          transition: transform 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default AnimatedCard;