import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaServer, FaDatabase, FaChartLine, FaDownload, FaPlay, FaStop, FaRefresh, FaCog } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const SystemMonitoring: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'system' | 'application' | 'database' | 'business'>('system');

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/performance/metrics'],
  });

  const { data: backupStatus, isLoading: backupLoading } = useQuery({
    queryKey: ['/backup/status'],
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value: number, type: 'usage' | 'rate') => {
    if (type === 'usage') {
      if (value > 80) return 'danger';
      if (value > 60) return 'warning';
      return 'success';
    } else {
      if (value > 5) return 'danger';
      if (value > 2) return 'warning';
      return 'success';
    }
  };

  const mockTimeSeriesData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 38 },
    { time: '04:00', cpu: 52, memory: 65, disk: 39 },
    { time: '08:00', cpu: 68, memory: 72, disk: 40 },
    { time: '12:00', cpu: 75, memory: 78, disk: 41 },
    { time: '16:00', cpu: 71, memory: 74, disk: 42 },
    { time: '20:00', cpu: 58, memory: 68, disk: 43 },
  ];

  if (isLoading || backupLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-1 text-dark">
            <FaServer className="me-2 text-primary" />
            System Monitoring
          </h2>
          <p className="text-muted mb-0">Real-time system performance and health monitoring</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={() => window.location.reload()}
          >
            <FaRefresh className="me-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'system' ? 'active' : ''}`}
                onClick={() => setSelectedTab('system')}
              >
                <FaServer className="me-2" />
                System
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'application' ? 'active' : ''}`}
                onClick={() => setSelectedTab('application')}
              >
                <FaChartLine className="me-2" />
                Application
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'database' ? 'active' : ''}`}
                onClick={() => setSelectedTab('database')}
              >
                <FaDatabase className="me-2" />
                Database
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${selectedTab === 'business' ? 'active' : ''}`}
                onClick={() => setSelectedTab('business')}
              >
                <FaCog className="me-2" />
                Business
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* System Tab */}
      {selectedTab === 'system' && metrics?.system && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-primary fw-bold">{metrics.system.cpuUsage}%</div>
                <div className="small text-muted">CPU Usage</div>
                <div className={`progress mt-2`} style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${getStatusColor(metrics.system.cpuUsage, 'usage')}`}
                    style={{ width: `${metrics.system.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-info fw-bold">{metrics.system.memoryUsage}%</div>
                <div className="small text-muted">Memory Usage</div>
                <div className={`progress mt-2`} style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${getStatusColor(metrics.system.memoryUsage, 'usage')}`}
                    style={{ width: `${metrics.system.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-warning fw-bold">{metrics.system.diskUsage}%</div>
                <div className="small text-muted">Disk Usage</div>
                <div className={`progress mt-2`} style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${getStatusColor(metrics.system.diskUsage, 'usage')}`}
                    style={{ width: `${metrics.system.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-success fw-bold">{metrics.system.networkLatency}ms</div>
                <div className="small text-muted">Network Latency</div>
                <div className={`progress mt-2`} style={{ height: '4px' }}>
                  <div
                    className={`progress-bar bg-${getStatusColor(metrics.system.networkLatency, 'rate')}`}
                    style={{ width: `${Math.min(metrics.system.networkLatency * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Application Tab */}
      {selectedTab === 'application' && metrics?.application && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-primary fw-bold">{metrics.application.responseTime}ms</div>
                <div className="small text-muted">Response Time</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-success fw-bold">{metrics.application.uptime}%</div>
                <div className="small text-muted">Uptime</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-warning fw-bold">{metrics.application.errorRate}%</div>
                <div className="small text-muted">Error Rate</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-info fw-bold">{metrics.application.activeUsers}</div>
                <div className="small text-muted">Active Users</div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {selectedTab === 'database' && metrics?.database && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-primary fw-bold">{metrics.database.queryTime}ms</div>
                <div className="small text-muted">Query Time</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-info fw-bold">{metrics.database.connections}</div>
                <div className="small text-muted">Connections</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-success fw-bold">{metrics.database.cacheHitRate}%</div>
                <div className="small text-muted">Cache Hit Rate</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-warning fw-bold">{metrics.database.storageUsed}</div>
                <div className="small text-muted">Storage Used</div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Business Tab */}
      {selectedTab === 'business' && metrics?.business && (
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-primary fw-bold">{metrics.business.ordersPerHour}</div>
                <div className="small text-muted">Orders/Hour</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-success fw-bold">${metrics.business.revenuePerHour}</div>
                <div className="small text-muted">Revenue/Hour</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-info fw-bold">{metrics.business.customerSatisfaction}/5</div>
                <div className="small text-muted">Customer Satisfaction</div>
              </div>
            </AnimatedCard>
          </div>
          <div className="col-md-3">
            <AnimatedCard>
              <div className="text-center">
                <div className="h4 mb-1 text-warning fw-bold">{metrics.business.conversionRate}%</div>
                <div className="small text-muted">Conversion Rate</div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <AnimatedCard>
            <div className="card-header">
              <h5 className="mb-0">Performance Trends (24h)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockTimeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="disk" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Backup Status */}
      {backupStatus && (
        <div className="row g-4">
          <div className="col-12">
            <AnimatedCard>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Backup Status</h5>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => createBackupMutation.mutate()}
                  disabled={createBackupMutation.isPending}
                >
                  {createBackupMutation.isPending ? (
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <FaDownload className="me-2" />
                  )}
                  Create Backup
                </button>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <FaDatabase className="text-primary me-2" />
                      <div>
                        <div className="fw-semibold">Last Backup</div>
                        <small className="text-muted">
                          {new Date(backupStatus.lastBackup).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <FaPlay className="text-success me-2" />
                      <div>
                        <div className="fw-semibold">Next Backup</div>
                        <small className="text-muted">
                          {new Date(backupStatus.nextBackup).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <FaCog className="text-info me-2" />
                      <div>
                        <div className="fw-semibold">Status</div>
                        <span className={`badge bg-${backupStatus.status === 'healthy' ? 'success' : 'warning'}`}>
                          {backupStatus.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex align-items-center">
                      <FaDownload className="text-warning me-2" />
                      <div>
                        <div className="fw-semibold">Size</div>
                        <small className="text-muted">{backupStatus.size}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitoring;
