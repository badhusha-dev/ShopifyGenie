import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaTrendingUp, FaTrendingDown, FaChartLine, FaExternalLinkAlt } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface MarketTrend {
  id: string;
  category: string;
  trend: string;
  change: string;
  description: string;
  impact: string;
  source: string;
  confidence?: string;
  timeframe?: string;
}

const MarketTrends: React.FC = () => {
  const { data: trends = [], isLoading } = useQuery<MarketTrend[]>({
    queryKey: ['/market-trends'],
  });

  const getTrendIcon = (change: string) => {
    const isPositive = change.startsWith('+');
    return isPositive ? <FaTrendingUp className="text-success" /> : <FaTrendingDown className="text-danger" />;
  };

  const getImpactBadge = (impact: string) => {
    const badgeClass = impact === 'positive' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
    return <span className={`badge ${badgeClass}`}>{impact}</span>;
  };

  const getConfidenceBadge = (confidence?: string) => {
    if (!confidence) return null;
    const badgeClass = confidence === 'high' ? 'bg-success-subtle text-success' : 
                      confidence === 'medium' ? 'bg-warning-subtle text-warning' : 
                      'bg-secondary-subtle text-secondary';
    return <span className={`badge ${badgeClass} small`}>{confidence}</span>;
  };

  if (isLoading) {
    return (
      <AnimatedCard>
        <div className="card-header">
          <h5 className="mb-0">Market Trends</h5>
        </div>
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
        <h5 className="mb-0">Market Trends</h5>
        <FaChartLine className="text-primary" />
      </div>
      <div className="card-body">
        <div className="trends-list">
          {trends.map((trend) => (
            <div key={trend.id} className="trend-item mb-3 p-3 border rounded">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-dark">{trend.trend}</h6>
                  <small className="text-muted">{trend.category}</small>
                </div>
                <div className="d-flex align-items-center">
                  {getTrendIcon(trend.change)}
                  <span className="ms-2 fw-bold">{trend.change}</span>
                </div>
              </div>
              
              <p className="text-muted small mb-2">{trend.description}</p>
              
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                  {getImpactBadge(trend.impact)}
                  {getConfidenceBadge(trend.confidence)}
                </div>
                <div className="text-end">
                  <small className="text-muted">
                    <FaExternalLinkAlt className="me-1" />
                    {trend.source}
                  </small>
                  {trend.timeframe && (
                    <div className="small text-muted">{trend.timeframe}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  );
};

export default MarketTrends;
