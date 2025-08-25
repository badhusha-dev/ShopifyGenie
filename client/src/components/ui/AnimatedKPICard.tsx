import React from 'react';

interface AnimatedKPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  gradient?: 'shopify' | 'coral' | 'blue' | 'purple';
  className?: string;
}

const AnimatedKPICard: React.FC<AnimatedKPICardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  gradient = 'shopify',
  className = ''
}) => {
  const gradientClasses = {
    shopify: 'bg-gradient-shopify',
    coral: 'bg-gradient-coral',
    blue: 'bg-primary',
    purple: 'bg-secondary'
  };

  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted'
  };

  const changeBgColors = {
    positive: 'bg-success-subtle',
    negative: 'bg-danger-subtle',
    neutral: 'bg-light'
  };

  return (
    <div className={`kpi-card animate-pulse-hover ${className}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div className="flex-grow-1">
          <p className="text-muted small fw-medium mb-2 text-uppercase" style={{letterSpacing: '0.5px'}}>
            {title}
          </p>
          <h3 className="h2 fw-bold text-dark mb-2 animate-counter">
            {value}
          </h3>
          {change && (
            <div className={`d-inline-flex align-items-center px-2 py-1 rounded-pill ${changeBgColors[changeType]}`}>
              <i className={`fas fa-arrow-${changeType === 'positive' ? 'up' : changeType === 'negative' ? 'down' : 'right'} me-1 small`}></i>
              <span className={`${changeColors[changeType]} fw-semibold small`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`kpi-card-icon ${gradientClasses[gradient]} text-white`}>
          <i className={`${icon} fa-lg`}></i>
        </div>
      </div>
    </div>
  );
};

export default AnimatedKPICard;