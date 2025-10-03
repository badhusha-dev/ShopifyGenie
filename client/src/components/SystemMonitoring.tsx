import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaServer, FaMicrochip, FaMemory, FaHdd, FaNetworkWired, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaUsers, FaDatabase, FaClock, FaInfoCircle, FaBrain, FaCog, FaBell, FaShieldAlt, FaRocket, FaThermometerHalf, FaTachometerAlt, FaBolt, FaEye, FaFilter, FaDownload } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import AnimatedCard from './ui/AnimatedCard';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: string;
  components: {
    database: { status: 'healthy' | 'degraded'; message: string };
    api: { status: 'healthy' | 'degraded'; message: string };
    websocket: { status: 'healthy' | 'degraded'; message: string };
  };
}

interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  activeConnections: number;
  errorRate: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'security' | 'availability' | 'capacity';
  source: string;
  recommendations?: string[];
}

interface PredictiveAnalytics {
  cpuForecast: Array<{ timestamp: string; predicted: number; confidence: number }>;
  memoryForecast: Array<{ timestamp: string; predicted: number; confidence: number }>;
  capacityPlanning: {
    currentUsage: number;
    projectedGrowth: number;
    recommendedAction: string;
    timeline: string;
  };
  performanceTrends: {
    trend: 'improving' | 'stable' | 'declining';
    factors: string[];
    recommendations: string[];
  };
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: string[];
  cooldown: number; // in minutes
}

interface PerformanceOptimization {
  suggestions: Array<{
    type: 'cpu' | 'memory' | 'disk' | 'network';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    estimatedImprovement: string;
  }>;
  automatedActions: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    lastRun: string;
    successRate: number;
  }>;
}

const SystemMonitoring: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'alerts' | 'optimization'>('overview');
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [showAlertRules, setShowAlertRules] = useState(false);
  const [showOptimization, setShowOptimization] = useState(false);

  const { data: health, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/system/health'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<SystemMetric[]>({
    queryKey: ['/system/metrics', timeRange],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery<SystemAlert[]>({
    queryKey: ['/system/alerts'],
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const { data: predictiveAnalytics } = useQuery<PredictiveAnalytics>({
    queryKey: ['/system/predictive-analytics'],
  });

  const { data: alertRules = [] } = useQuery<AlertRule[]>({
    queryKey: ['/system/alert-rules'],
  });

  const { data: performanceOptimization } = useQuery<PerformanceOptimization>({
    queryKey: ['/system/performance-optimization'],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success';
      case 'degraded': return 'bg-warning text-dark';
      case 'unhealthy': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      case 'info': return <FaInfoCircle className="text-info" />;
      default: return <FaExclamationTriangle className="text-muted" />;
    }
  };

  const getAlertClass = (type: string) => {
    switch (type) {
      case 'warning': return 'list-group-item-warning';
      case 'error': return 'list-group-item-danger';
      case 'info': return 'list-group-item-info';
      default: return '';
    }
  };

  const systemStats = [
    {
      title: 'CPU Usage',
      value: metrics.length > 0 ? `${metrics[metrics.length - 1]?.cpu || 0}%` : '0%',
      icon: FaMicrochip,
      color: 'primary',
      trend: metrics.length > 1 ? (metrics[metrics.length - 1]?.cpu || 0) - (metrics[metrics.length - 2]?.cpu || 0) : 0
    },
    {
      title: 'Memory Usage',
      value: metrics.length > 0 ? `${metrics[metrics.length - 1]?.memory || 0}%` : '0%',
      icon: FaMemory,
      color: 'info',
      trend: metrics.length > 1 ? (metrics[metrics.length - 1]?.memory || 0) - (metrics[metrics.length - 2]?.memory || 0) : 0
    },
    {
      title: 'Disk Usage',
      value: metrics.length > 0 ? `${metrics[metrics.length - 1]?.disk || 0}%` : '0%',
      icon: FaHdd,
      color: 'warning',
      trend: metrics.length > 1 ? (metrics[metrics.length - 1]?.disk || 0) - (metrics[metrics.length - 2]?.disk || 0) : 0
    },
    {
      title: 'Response Time',
      value: metrics.length > 0 ? `${metrics[metrics.length - 1]?.responseTime || 0}ms` : '0ms',
      icon: FaNetworkWired,
      color: 'success',
      trend: metrics.length > 1 ? (metrics[metrics.length - 1]?.responseTime || 0) - (metrics[metrics.length - 2]?.responseTime || 0) : 0
    }
  ];

  if (healthLoading || metricsLoading || alertsLoading) {
    return (
      <AnimatedCard>
        <div className="card-header">
          <h5 className="mb-0">System Monitoring</h5>
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
        <h5 className="mb-0">Advanced System Monitoring</h5>
        <div className="d-flex align-items-center gap-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="autoRefresh">
              Auto Refresh
            </label>
          </div>
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => setShowPredictiveAnalytics(!showPredictiveAnalytics)}
          >
            <FaBrain className="me-1" />
            AI Analytics
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => setShowAlertRules(!showAlertRules)}
          >
            <FaBell className="me-1" />
            Alert Rules
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => setShowOptimization(!showOptimization)}
          >
            <FaRocket className="me-1" />
            Optimize
          </button>
          <FaServer className="text-primary" />
        </div>
      </div>
      <div className="card-body">
        {/* System Health Overview */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">System Health Overview</h6>
          {health && (
            <div className={`alert ${getStatusBadge(health.status)} text-white mb-3`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="alert-title mb-1">{health.status.toUpperCase()}</h5>
                  <p className="mb-0">{health.message}</p>
                  <small>Last checked: {new Date(health.timestamp).toLocaleString()}</small>
                </div>
                <FaCheckCircle size={32} />
              </div>
              <div className="mt-3">
                {Object.entries(health.components).map(([comp, data]) => (
                  <span key={comp} className={`badge ${getStatusBadge(data.status)} me-2`}>
                    {comp}: {data.status}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* System Stats */}
        <div className="row g-3 mb-4">
          {systemStats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div className="text-center p-3 bg-light rounded">
                <stat.icon className={`text-${stat.color} mb-2`} size={24} />
                <div className="h5 mb-1">{stat.value}</div>
                <div className="small text-muted">{stat.title}</div>
                {stat.trend !== 0 && (
                  <div className={`small ${stat.trend > 0 ? 'text-danger' : 'text-success'}`}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics Chart */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0">Performance Metrics</h6>
            <div className="d-flex gap-2">
              {['1h', '6h', '24h', '7d'].map(range => (
                <button
                  key={range}
                  className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => new Date(tick).toLocaleTimeString()} 
                  stroke="#666" 
                />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#8884d8" 
                  name="CPU Usage (%)" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#82ca9d" 
                  name="Memory Usage (%)" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#ffc658" 
                  name="Response Time (ms)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced System Alerts */}
        <div>
          <h6 className="fw-bold mb-3">System Alerts</h6>
          {alerts.length === 0 ? (
            <div className="text-center py-4">
              <FaCheckCircle className="text-success mb-3" size={48} />
              <p className="text-muted">No active system alerts</p>
            </div>
          ) : (
            <div className="list-group">
              {alerts.map((alert) => (
                <div key={alert.id} className={`list-group-item ${getAlertClass(alert.type)} d-flex align-items-center`}>
                  <div className="me-3 fs-5">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{alert.message}</h6>
                        <small className="text-muted">
                          {new Date(alert.timestamp).toLocaleString()}
                          {alert.resolved && <span className="ms-2 badge bg-success">Resolved</span>}
                        </small>
                        {alert.recommendations && alert.recommendations.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">Recommendations:</small>
                            <ul className="small text-muted mb-0">
                              {alert.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-end">
                        <span className={`badge ${alert.resolved ? 'bg-success' : 'bg-warning'}`}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                        <div className="small text-muted mt-1">
                          {alert.severity} • {alert.category}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictive Analytics Panel */}
        {showPredictiveAnalytics && predictiveAnalytics && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">
              <FaBrain className="me-2" />
              AI-Powered Predictive Analytics
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Capacity Planning</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Current Usage</span>
                        <span>{predictiveAnalytics.capacityPlanning.currentUsage}%</span>
                      </div>
                      <div className="progress">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${predictiveAnalytics.capacityPlanning.currentUsage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Projected Growth</span>
                        <span>+{predictiveAnalytics.capacityPlanning.projectedGrowth}%</span>
                      </div>
                    </div>
                    <div className="alert alert-info">
                      <strong>Recommendation:</strong> {predictiveAnalytics.capacityPlanning.recommendedAction}
                    </div>
                    <small className="text-muted">Timeline: {predictiveAnalytics.capacityPlanning.timeline}</small>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Performance Trends</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Trend:</span>
                        <span className={`badge ${
                          predictiveAnalytics.performanceTrends.trend === 'improving' ? 'bg-success' :
                          predictiveAnalytics.performanceTrends.trend === 'stable' ? 'bg-info' : 'bg-warning'
                        }`}>
                          {predictiveAnalytics.performanceTrends.trend}
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Key Factors:</strong>
                      <ul className="small text-muted mb-0">
                        {predictiveAnalytics.performanceTrends.factors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="alert alert-success">
                      <strong>Recommendations:</strong>
                      <ul className="small mb-0">
                        {predictiveAnalytics.performanceTrends.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Rules Panel */}
        {showAlertRules && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">
              <FaBell className="me-2" />
              Alert Rules Management
            </h6>
            <div className="row g-3">
              {alertRules.map((rule) => (
                <div key={rule.id} className="col-md-6">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{rule.name}</h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="small text-muted mb-2">{rule.condition}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-secondary">Threshold: {rule.threshold}</span>
                        <span className={`badge ${
                          rule.severity === 'critical' ? 'bg-danger' :
                          rule.severity === 'high' ? 'bg-warning' :
                          rule.severity === 'medium' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {rule.severity}
                        </span>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">Cooldown: {rule.cooldown} minutes</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Optimization Panel */}
        {showOptimization && performanceOptimization && (
          <div className="mt-4 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3">
              <FaRocket className="me-2" />
              Performance Optimization
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Optimization Suggestions</h6>
                  </div>
                  <div className="card-body">
                    {performanceOptimization.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-3 p-2 border rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{suggestion.title}</h6>
                            <p className="small text-muted mb-2">{suggestion.description}</p>
                            <small className="text-muted">Impact: {suggestion.estimatedImprovement}</small>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${
                              suggestion.impact === 'high' ? 'bg-danger' :
                              suggestion.impact === 'medium' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {suggestion.impact} impact
                            </span>
                            <div className="small text-muted mt-1">
                              {suggestion.effort} effort
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Automated Actions</h6>
                  </div>
                  <div className="card-body">
                    {performanceOptimization.automatedActions.map((action) => (
                      <div key={action.id} className="mb-3 p-2 border rounded">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{action.name}</h6>
                            <p className="small text-muted mb-2">{action.description}</p>
                            <small className="text-muted">
                              Last run: {new Date(action.lastRun).toLocaleString()}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={action.enabled}
                                onChange={() => {}}
                              />
                            </div>
                            <div className="small text-muted mt-1">
                              {action.successRate}% success
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

export default SystemMonitoring;