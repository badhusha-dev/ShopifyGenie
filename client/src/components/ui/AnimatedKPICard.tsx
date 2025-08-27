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
    <div className={`modern-card p-4 h-100 ${className}`}>
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
      <style>{`
        .animated-kpi-card {
          background: linear-gradient(135deg, var(--shopify-green-light) 0%, var(--shopify-green) 100%);
          border: none;
          border-radius: var(--radius-2xl);
          color: white;
          box-shadow: var(--shadow-lg);
          transition: all var(--duration-normal) ease;
          position: relative;
          overflow: hidden;
        }

        .animated-kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity var(--duration-normal) ease;
        }

        .animated-kpi-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }

        .animated-kpi-card:hover::before {
          opacity: 1;
        }

        .kpi-icon {
          transition: transform var(--duration-normal) ease;
        }

        .animated-kpi-card:hover .kpi-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .kpi-value {
          font-size: 2.5rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          animation: countUp var(--duration-slow) ease-out;
        }

        .kpi-label {
          opacity: 0.9;
          font-weight: 500;
        }

        .kpi-trend {
          animation: slideInRight 0.8s ease-out 0.3s both;
        }

        @keyframes countUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .trend-positive {
          color: #a7f3d0;
        }

        .trend-negative {
          color: #fca5a5;
        }

        .trend-neutral {
          color: #d1d5db;
        }

        /* Dark mode adjustments */
        [data-bs-theme="dark"] .animated-kpi-card {
          box-shadow: var(--shadow-xl);
        }

        [data-bs-theme="dark"] .kpi-value {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AnimatedKPICard;