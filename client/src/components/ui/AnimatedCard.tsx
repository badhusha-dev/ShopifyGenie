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

  const baseStyles: React.CSSProperties = {
    transition: 'all 0.3s ease',
    border: '1px solid #e0e6ed',
    borderRadius: '12px',
    background: 'white',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <div 
      className={`animated-card modern-card ${hover ? 'card-hover' : ''} ${gradientClasses[gradient]} ${className}`}
      onClick={onClick}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;