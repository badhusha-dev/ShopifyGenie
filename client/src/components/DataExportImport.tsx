import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaDownload, FaUpload, FaFileCsv, FaFileExcel, FaFilePdf, FaSpinner } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  reportType?: string;
}

const DataExportImport: React.FC = () => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv'
  });
  const [selectedDataType, setSelectedDataType] = useState<string>('sales');

  const exportMutation = useMutation({
    mutationFn: async ({ dataType, options }: { dataType: string; options: ExportOptions }) => {
      const params = new URLSearchParams();
      params.append('format', options.format);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.reportType) params.append('reportType', options.reportType);

      const response = await fetch(`/api/export/${dataType}?${params.toString()}`);
      if (!response.ok) throw new Error('Export failed');
      
      if (options.format === 'csv' || options.format === 'pdf' || options.format === 'excel') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}-data.${options.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        return response.json();
      }
    },
    onSuccess: () => {
      alert('Export completed successfully!');
    },
    onError: (error) => {
      alert(`Export failed: ${error.message}`);
    }
  });

  const handleExport = () => {
    exportMutation.mutate({ dataType: selectedDataType, options: exportOptions });
  };

  const dataTypes = [
    { value: 'sales', label: 'Sales Data', description: 'Export sales transactions and revenue data' },
    { value: 'inventory', label: 'Inventory Data', description: 'Export product inventory and stock levels' },
    { value: 'customers', label: 'Customer Data', description: 'Export customer information and order history' },
    { value: 'reports', label: 'Business Reports', description: 'Export comprehensive business reports' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FaFileCsv, description: 'Comma-separated values for Excel' },
    { value: 'json', label: 'JSON', icon: FaFileCsv, description: 'Structured data format' },
    { value: 'pdf', label: 'PDF', icon: FaFilePdf, description: 'Portable document format' },
    { value: 'excel', label: 'Excel', icon: FaFileExcel, description: 'Microsoft Excel format' }
  ];

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'customer', label: 'Customer Report' }
  ];

  return (
    <AnimatedCard>
      <div className="card-header">
        <h5 className="mb-0">Data Export & Import</h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          {/* Data Type Selection */}
                <div className="col-md-6">
            <h6 className="fw-bold mb-3">Select Data Type</h6>
            <div className="list-group">
              {dataTypes.map((type) => (
                <label key={type.value} className="list-group-item">
                  <input
                    type="radio"
                    name="dataType"
                    value={type.value}
                    checked={selectedDataType === type.value}
                    onChange={(e) => setSelectedDataType(e.target.value)}
                    className="form-check-input me-2"
                  />
                  <div>
                    <div className="fw-semibold">{type.label}</div>
                    <small className="text-muted">{type.description}</small>
                </div>
                </label>
              ))}
                </div>
              </div>

          {/* Export Options */}
          <div className="col-md-6">
            <h6 className="fw-bold mb-3">Export Options</h6>
            
            {/* Format Selection */}
            <div className="mb-3">
              <label className="form-label">Format</label>
              <div className="row g-2">
                {formatOptions.map((format) => (
                  <div key={format.value} className="col-6">
                    <label className="form-check-label d-block p-2 border rounded">
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={exportOptions.format === format.value}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                        className="form-check-input me-2"
                      />
                      <format.icon className="me-2" />
                      {format.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            {/* Date Range */}
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={exportOptions.startDate || ''}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, startDate: e.target.value }))}
                />
                        </div>
              <div className="col-6">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={exportOptions.endDate || ''}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, endDate: e.target.value }))}
                />
                      </div>
                    </div>

            {/* Report Type (for reports data type) */}
            {selectedDataType === 'reports' && (
              <div className="mb-3">
                <label className="form-label">Report Type</label>
                <select
                  className="form-select form-select-sm"
                  value={exportOptions.reportType || 'sales'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, reportType: e.target.value }))}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

              {/* Export Button */}
                <button
              className="btn btn-primary w-100"
                  onClick={handleExport}
              disabled={exportMutation.isPending}
                >
              {exportMutation.isPending ? (
                    <>
                  <FaSpinner className="me-2 fa-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                  <FaDownload className="me-2" />
                      Export Data
                    </>
                  )}
                </button>
            </div>
          </div>

        {/* Import Section */}
        <div className="mt-4 pt-4 border-top">
          <h6 className="fw-bold mb-3">Data Import</h6>
          <div className="row g-3">
            <div className="col-md-8">
                      <input
                        type="file"
                className="form-control"
                        accept=".csv,.xlsx,.json"
                placeholder="Select file to import"
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-outline-primary w-100">
                <FaUpload className="me-2" />
                Import Data
                          </button>
            </div>
          </div>
          <small className="text-muted">
            Supported formats: CSV, Excel (.xlsx), JSON. Maximum file size: 10MB.
          </small>
        </div>
                </div>
    </AnimatedCard>
  );
};

export default DataExportImport;