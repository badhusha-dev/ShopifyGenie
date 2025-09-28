import React, { useState } from 'react';
import DataExportImport from '../components/DataExportImport';
import BackupRestore from '../components/BackupRestore';
import { FaDatabase, FaDownload, FaUpload, FaCloud, FaShieldAlt, FaCog } from 'react-icons/fa';
import AnimatedCard from '../components/ui/AnimatedCard';

const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'export' | 'backup' | 'overview'>('overview');

  const dataStats = [
    {
      title: 'Total Records',
      value: '125,847',
      icon: FaDatabase,
      color: 'primary',
      description: 'All data records in system'
    },
    {
      title: 'Backups Created',
      value: '24',
      icon: FaCloud,
      color: 'success',
      description: 'Automated backups this month'
    },
    {
      title: 'Exports This Month',
      value: '156',
      icon: FaDownload,
      color: 'info',
      description: 'Data exports completed'
    },
    {
      title: 'Data Integrity',
      value: '99.9%',
      icon: FaShieldAlt,
      color: 'warning',
      description: 'System data integrity score'
    }
  ];

  return (
    <div className="data-management-page">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Data Management Center</h2>
              <p className="text-muted mb-0">Comprehensive data management, backup, and export tools</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <FaCog className="me-1" />
                Overview
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'export' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('export')}
              >
                <FaDownload className="me-1" />
                Export/Import
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'backup' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('backup')}
              >
                <FaCloud className="me-1" />
                Backup/Restore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Data Statistics */}
          <div className="row g-4 mb-4">
            {dataStats.map((stat, index) => (
              <div key={index} className="col-md-3">
                <AnimatedCard className="h-100">
                  <div className="d-flex align-items-center">
                    <div className={`icon-circle bg-${stat.color} text-white me-3`}>
                      <stat.icon />
                    </div>
                    <div>
                      <h4 className="mb-0">{stat.value}</h4>
                      <h6 className="mb-1">{stat.title}</h6>
                      <small className="text-muted">{stat.description}</small>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <AnimatedCard>
                <h5 className="mb-3">
                  <FaDownload className="me-2 text-primary" />
                  Data Export & Import
                </h5>
                <p className="text-muted mb-3">
                  Export your data in multiple formats (CSV, JSON, PDF, Excel) or import data from external sources.
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setActiveTab('export')}
                  >
                    <FaDownload className="me-1" />
                    Export Data
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setActiveTab('export')}
                  >
                    <FaUpload className="me-1" />
                    Import Data
                  </button>
                </div>
              </AnimatedCard>
            </div>
            <div className="col-md-6">
              <AnimatedCard>
                <h5 className="mb-3">
                  <FaCloud className="me-2 text-success" />
                  Backup & Restore
                </h5>
                <p className="text-muted mb-3">
                  Create automated backups, restore from previous states, and manage cloud storage integration.
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => setActiveTab('backup')}
                  >
                    <FaCloud className="me-1" />
                    Create Backup
                  </button>
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => setActiveTab('backup')}
                  >
                    <FaShieldAlt className="me-1" />
                    Restore Data
                  </button>
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row g-4">
            <div className="col-md-6">
              <AnimatedCard>
                <h5 className="mb-3">Recent Exports</h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Sales Data Export</h6>
                      <small className="text-muted">CSV format • 2 hours ago</small>
                    </div>
                    <span className="badge bg-success">Completed</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Customer Database</h6>
                      <small className="text-muted">Excel format • 1 day ago</small>
                    </div>
                    <span className="badge bg-success">Completed</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Inventory Report</h6>
                      <small className="text-muted">PDF format • 3 days ago</small>
                    </div>
                    <span className="badge bg-warning">In Progress</span>
                  </div>
                </div>
              </AnimatedCard>
            </div>
            <div className="col-md-6">
              <AnimatedCard>
                <h5 className="mb-3">Recent Backups</h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Daily Backup</h6>
                      <small className="text-muted">Full backup • 6 hours ago</small>
                    </div>
                    <span className="badge bg-success">Completed</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Weekly Backup</h6>
                      <small className="text-muted">Incremental • 2 days ago</small>
                    </div>
                    <span className="badge bg-success">Completed</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">Monthly Archive</h6>
                      <small className="text-muted">Full backup • 1 week ago</small>
                    </div>
                    <span className="badge bg-info">Archived</span>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </>
      )}

      {/* Export/Import Tab */}
      {activeTab === 'export' && (
        <div className="row">
          <div className="col-12">
            <DataExportImport />
          </div>
        </div>
      )}

      {/* Backup/Restore Tab */}
      {activeTab === 'backup' && (
        <div className="row">
          <div className="col-12">
            <BackupRestore />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
