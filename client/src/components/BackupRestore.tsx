import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaDownload, FaUpload, FaHistory, FaTrash, FaClock, FaCheckCircle, FaExclamationTriangle, FaDatabase, FaFileArchive, FaCloud, FaCog, FaCalendar, FaShieldAlt, FaSync, FaCheck, FaTimes, FaPlay, FaPause, FaEdit, FaEye, FaCopy, FaShare, FaChartLine, FaBolt, FaGlobe, FaHdd, FaServer } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress' | 'scheduled' | 'paused';
  description: string;
  location: 'local' | 'cloud' | 'hybrid';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
    time: string;
    days?: string[];
    cron?: string;
  };
  retention: {
    days: number;
    maxBackups: number;
  };
  encryption: boolean;
  compression: boolean;
  verification: {
    status: 'verified' | 'pending' | 'failed';
    lastVerified?: string;
    checksum?: string;
  };
  cloudProvider?: 'aws' | 'azure' | 'gcp' | 'dropbox' | 'onedrive';
  tags: string[];
  metadata: {
    version: string;
    databaseVersion: string;
    applicationVersion: string;
    totalRecords: number;
  };
}

interface RestorePoint {
  id: string;
  name: string;
  timestamp: string;
  size: string;
  status: 'available' | 'corrupted' | 'incomplete';
  location: 'local' | 'cloud';
  verification: {
    status: 'verified' | 'pending' | 'failed';
    checksum?: string;
  };
  metadata: {
    version: string;
    totalRecords: number;
    compressionRatio: number;
  };
}

interface BackupSchedule {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  days?: string[];
  cron?: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  backupType: 'full' | 'incremental' | 'differential';
  retention: {
    days: number;
    maxBackups: number;
  };
  location: 'local' | 'cloud' | 'hybrid';
  cloudProvider?: 'aws' | 'azure' | 'gcp' | 'dropbox' | 'onedrive';
  encryption: boolean;
  compression: boolean;
  verification: boolean;
  tags: string[];
}

interface CloudIntegration {
  provider: 'aws' | 'azure' | 'gcp' | 'dropbox' | 'onedrive';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalStorage: string;
  usedStorage: string;
  availableStorage: string;
  credentials: {
    valid: boolean;
    expiresAt?: string;
  };
  settings: {
    region?: string;
    bucket?: string;
    folder?: string;
    encryption: boolean;
    compression: boolean;
  };
}

interface BackupAnalytics {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  totalSize: string;
  averageSize: string;
  compressionRatio: number;
  verificationSuccessRate: number;
  cloudSyncSuccessRate: number;
  trends: Array<{
    date: string;
    backups: number;
    size: string;
    successRate: number;
  }>;
}

const BackupRestore: React.FC = () => {
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'cloud' | 'analytics'>('backups');
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'differential'>('full');
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const queryClient = useQueryClient();

  const { data: backups = [], isLoading: backupsLoading } = useQuery<Backup[]>({
    queryKey: ['/backups'],
  });

  const { data: restorePoints = [] } = useQuery<RestorePoint[]>({
    queryKey: ['/restore-points'],
  });

  const { data: schedules = [] } = useQuery<BackupSchedule[]>({
    queryKey: ['/backup-schedules'],
  });

  const { data: cloudIntegrations = [] } = useQuery<CloudIntegration[]>({
    queryKey: ['/cloud-integrations'],
  });

  const { data: analytics } = useQuery<BackupAnalytics>({
    queryKey: ['/backup-analytics'],
  });

  const createBackupMutation = useMutation({
    mutationFn: async (backupData: { name: string; type: string; description: string }) => {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      if (!response.ok) throw new Error('Failed to create backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/backups'] });
      setShowCreateModal(false);
      setBackupName('');
      setBackupDescription('');
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`/api/backups/${backupId}/restore`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to restore backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/backups'] });
      setShowRestoreModal(false);
      setSelectedBackup(null);
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      const response = await fetch(`/api/backups/${backupId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete backup');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/backups'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'failed': return 'bg-danger';
      case 'in_progress': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-success" />;
      case 'failed': return <FaExclamationTriangle className="text-danger" />;
      case 'in_progress': return <FaClock className="text-warning" />;
      default: return <FaClock className="text-secondary" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <FaDatabase className="text-primary" />;
      case 'incremental': return <FaFileArchive className="text-info" />;
      case 'differential': return <FaCloud className="text-success" />;
      default: return <FaDatabase className="text-secondary" />;
    }
  };

  const getLocationIcon = (location: string) => {
    return location === 'cloud' ? <FaCloud className="text-info" /> : <FaDatabase className="text-secondary" />;
  };

  const backupStats = [
    {
      title: 'Total Backups',
      value: backups.length,
      icon: FaDatabase,
      color: 'primary'
    },
    {
      title: 'Successful',
      value: backups.filter(b => b.status === 'completed').length,
      icon: FaCheckCircle,
      color: 'success'
    },
    {
      title: 'Failed',
      value: backups.filter(b => b.status === 'failed').length,
      icon: FaExclamationTriangle,
      color: 'danger'
    },
    {
      title: 'Total Size',
      value: backups.reduce((acc, b) => acc + parseFloat(b.size.replace(/[^\d.]/g, '')), 0).toFixed(1) + ' GB',
      icon: FaFileArchive,
      color: 'info'
    }
  ];

  if (backupsLoading) {
    return (
      <AnimatedCard>
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
        <h5 className="mb-0">Advanced Backup & Restore</h5>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <FaDownload className="me-1" />
            Create Backup
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowRestoreModal(true)}
          >
            <FaUpload className="me-1" />
            Restore
          </button>
          <button
            className="btn btn-outline-info btn-sm"
            onClick={() => setShowScheduleModal(true)}
          >
            <FaCalendar className="me-1" />
            Schedule
          </button>
          <button
            className="btn btn-outline-success btn-sm"
            onClick={() => setShowCloudModal(true)}
          >
            <FaCloud className="me-1" />
            Cloud
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => setShowAnalyticsModal(true)}
          >
            <FaChartLine className="me-1" />
            Analytics
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Enhanced Backup Stats */}
        <div className="row g-3 mb-4">
          {backupStats.map((stat, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div className="text-center p-3 bg-light rounded">
                <stat.icon className={`text-${stat.color} mb-2`} size={24} />
                <div className="h5 mb-1">{stat.value}</div>
                <div className="small text-muted">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'backups' ? 'active' : ''}`}
                onClick={() => setActiveTab('backups')}
              >
                <FaDatabase className="me-1" />
                Backups
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedules')}
              >
                <FaCalendar className="me-1" />
                Schedules
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'cloud' ? 'active' : ''}`}
                onClick={() => setActiveTab('cloud')}
              >
                <FaCloud className="me-1" />
                Cloud Integration
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <FaChartLine className="me-1" />
                Analytics
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        {activeTab === 'backups' && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Recent Backups</h6>
            {backups.length === 0 ? (
              <div className="text-center py-4">
                <FaDatabase className="text-muted mb-3" size={48} />
                <p className="text-muted">No backups found</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create First Backup
                </button>
              </div>
            ) : (
              <div className="list-group">
                {backups.map((backup) => (
                  <div key={backup.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          {getStatusIcon(backup.status)}
                          <h6 className="mb-0 ms-2">{backup.name}</h6>
                          <span className={`badge ${getStatusBadge(backup.status)} ms-2`}>
                            {backup.status}
                          </span>
                          <span className="badge bg-secondary ms-2">
                            {backup.type}
                          </span>
                          {backup.encryption && (
                            <span className="badge bg-warning ms-2">
                              <FaShieldAlt className="me-1" />
                              Encrypted
                            </span>
                          )}
                          {backup.compression && (
                            <span className="badge bg-info ms-2">
                              <FaFileArchive className="me-1" />
                              Compressed
                            </span>
                          )}
                        </div>
                        <p className="text-muted small mb-2">{backup.description}</p>
                        <div className="d-flex gap-4 small text-muted mb-2">
                          <span>Size: {backup.size}</span>
                          <span>Created: {new Date(backup.createdAt).toLocaleString()}</span>
                          <span className="d-flex align-items-center">
                            {getLocationIcon(backup.location)}
                            <span className="ms-1">{backup.location}</span>
                          </span>
                        </div>
                        {backup.verification && (
                          <div className="d-flex align-items-center gap-3 small">
                            <span className="d-flex align-items-center">
                              <FaCheckCircle className={`me-1 ${backup.verification.status === 'verified' ? 'text-success' : 'text-warning'}`} />
                              Verification: {backup.verification.status}
                            </span>
                            {backup.verification.lastVerified && (
                              <span>Last verified: {new Date(backup.verification.lastVerified).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        {backup.tags && backup.tags.length > 0 && (
                          <div className="mt-2">
                            {backup.tags.map((tag, index) => (
                              <span key={index} className="badge bg-light text-dark small me-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          disabled={backup.status !== 'completed'}
                          title="Restore Backup"
                        >
                          <FaUpload />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-info"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          title="Copy Backup"
                        >
                          <FaCopy />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteBackupMutation.mutate(backup.id)}
                          title="Delete Backup"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Backup Schedules</h6>
            {schedules.length === 0 ? (
              <div className="text-center py-4">
                <FaCalendar className="text-muted mb-3" size={48} />
                <p className="text-muted">No backup schedules configured</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowScheduleModal(true)}
                >
                  Create Schedule
                </button>
              </div>
            ) : (
              <div className="list-group">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendar className="text-primary me-2" />
                          <h6 className="mb-0">{schedule.name}</h6>
                          <span className={`badge ${schedule.enabled ? 'bg-success' : 'bg-secondary'} ms-2`}>
                            {schedule.enabled ? 'Active' : 'Inactive'}
                          </span>
                          <span className="badge bg-info ms-2">
                            {schedule.frequency}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">{schedule.description}</p>
                        <div className="d-flex gap-4 small text-muted">
                          <span>Type: {schedule.backupType}</span>
                          <span>Time: {schedule.time}</span>
                          {schedule.lastRun && (
                            <span>Last run: {new Date(schedule.lastRun).toLocaleString()}</span>
                          )}
                          {schedule.nextRun && (
                            <span>Next run: {new Date(schedule.nextRun).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Edit Schedule"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          title={schedule.enabled ? 'Pause Schedule' : 'Resume Schedule'}
                        >
                          {schedule.enabled ? <FaPause /> : <FaPlay />}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Schedule"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cloud' && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Cloud Integration</h6>
            {cloudIntegrations.length === 0 ? (
              <div className="text-center py-4">
                <FaCloud className="text-muted mb-3" size={48} />
                <p className="text-muted">No cloud providers configured</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCloudModal(true)}
                >
                  Add Cloud Provider
                </button>
              </div>
            ) : (
              <div className="row g-3">
                {cloudIntegrations.map((integration) => (
                  <div key={integration.provider} className="col-md-6">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-capitalize">{integration.provider}</h6>
                        <span className={`badge ${
                          integration.status === 'connected' ? 'bg-success' :
                          integration.status === 'disconnected' ? 'bg-secondary' : 'bg-danger'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>Used Storage</span>
                            <span>{integration.usedStorage} / {integration.totalStorage}</span>
                          </div>
                          <div className="progress">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${(parseFloat(integration.usedStorage) / parseFloat(integration.totalStorage)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm">
                            <FaSync className="me-1" />
                            Sync Now
                          </button>
                          <button className="btn btn-outline-secondary btn-sm">
                            <FaCog className="me-1" />
                            Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="mb-4">
            <h6 className="fw-bold mb-3">Backup Analytics</h6>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h5 text-primary">{analytics.totalBackups}</div>
                  <div className="small text-muted">Total Backups</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h5 text-success">{analytics.successfulBackups}</div>
                  <div className="small text-muted">Successful</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h5 text-info">{analytics.compressionRatio}%</div>
                  <div className="small text-muted">Compression Ratio</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center p-3 bg-light rounded">
                  <div className="h5 text-warning">{analytics.verificationSuccessRate}%</div>
                  <div className="small text-muted">Verification Success</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore Points */}
        <div>
          <h6 className="fw-bold mb-3">Available Restore Points</h6>
          {restorePoints.length === 0 ? (
            <p className="text-muted">No restore points available</p>
          ) : (
            <div className="list-group">
              {restorePoints.map((point) => (
                <div key={point.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{point.name}</h6>
                    <small className="text-muted">
                      {new Date(point.timestamp).toLocaleString()} • {point.size}
                    </small>
                  </div>
                  <div>
                    <span className={`badge ${point.status === 'available' ? 'bg-success' : 'bg-danger'}`}>
                      {point.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Backup</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createBackupMutation.mutate({
                    name: backupName,
                    type: backupType,
                    description: backupDescription
                  });
                }}>
                  <div className="mb-3">
                    <label className="form-label">Backup Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={backupName}
                      onChange={(e) => setBackupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Backup Type</label>
                    <select
                      className="form-select"
                      value={backupType}
                      onChange={(e) => setBackupType(e.target.value as any)}
                    >
                      <option value="full">Full Backup</option>
                      <option value="incremental">Incremental Backup</option>
                      <option value="differential">Differential Backup</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={backupDescription}
                      onChange={(e) => setBackupDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      Create Backup
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Restore Backup</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRestoreModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <FaExclamationTriangle className="me-2" />
                  <strong>Warning:</strong> This action will restore the selected backup and may overwrite current data.
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Backup to Restore</label>
                  <select
                    className="form-select"
                    value={selectedBackup?.id || ''}
                    onChange={(e) => {
                      const backup = backups.find(b => b.id === e.target.value);
                      setSelectedBackup(backup || null);
                    }}
                  >
                    <option value="">Select a backup</option>
                    {backups.filter(b => b.status === 'completed').map(backup => (
                      <option key={backup.id} value={backup.id}>
                        {backup.name} - {new Date(backup.createdAt).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBackup && (
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6>{selectedBackup.name}</h6>
                    <p className="small text-muted mb-2">{selectedBackup.description}</p>
                    <div className="small text-muted">
                      <div>Type: {selectedBackup.type}</div>
                      <div>Size: {selectedBackup.size}</div>
                      <div>Created: {new Date(selectedBackup.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                )}
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger"
                    onClick={() => selectedBackup && restoreBackupMutation.mutate(selectedBackup.id)}
                    disabled={!selectedBackup || restoreBackupMutation.isPending}
                  >
                    {restoreBackupMutation.isPending ? 'Restoring...' : 'Restore Backup'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRestoreModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedCard>
  );
};

export default BackupRestore;
