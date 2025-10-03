import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FaDownload, FaUpload, FaFileCsv, FaFileExcel, FaFilePdf, FaSpinner, FaDatabase } from 'react-icons/fa';
import AnimatedCard from './ui/AnimatedCard';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedDataType, setSelectedDataType] = useState<string>('full_app');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async ({ dataType, options }: { dataType: string; options: ExportOptions }) => {
      if (dataType === 'full_app') {
        const res = await apiRequest('POST', '/api/data/export');
        const response = await res.json();
        
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return response;
      }

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
      toast({
        title: 'Export successful',
        description: 'Your data has been exported successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (error) {
        throw new Error('Invalid JSON file. Please select a valid export file.');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid export file format. The file must contain a valid data object.');
      }
      
      const res = await apiRequest('POST', '/api/data/import', data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Import successful',
        description: 'Your data has been imported successfully. The page will refresh.',
      });
      setTimeout(() => window.location.reload(), 2000);
    },
    onError: (error) => {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import data',
        variant: 'destructive',
      });
    }
  });

  const handleExport = () => {
    exportMutation.mutate({ dataType: selectedDataType, options: exportOptions });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a JSON file exported from this application.',
          variant: 'destructive',
        });
        return;
      }
      importMutation.mutate(file);
    }
  };

  const dataTypes = [
    { value: 'full_app', label: 'Full App Data (Migration)', description: 'Export all data for app migration to new instance', icon: FaDatabase },
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
          <h6 className="fw-bold mb-3">
            <FaDatabase className="me-2" />
            Full App Data Import (Migration)
          </h6>
          <p className="text-muted small mb-3">
            Import a complete app data export JSON file to migrate data from another instance. 
            <strong className="text-warning"> Warning: This will replace ALL existing data!</strong>
          </p>
          <div className="row g-3">
            <div className="col-md-8">
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                accept=".json"
                onChange={handleFileChange}
                disabled={importMutation.isPending}
                data-testid="input-import-file"
              />
            </div>
            <div className="col-md-4">
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => fileInputRef.current?.click()}
                disabled={importMutation.isPending}
                data-testid="button-import"
              >
                {importMutation.isPending ? (
                  <>
                    <FaSpinner className="me-2 fa-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FaUpload className="me-2" />
                    Select File to Import
                  </>
                )}
              </button>
            </div>
          </div>
          <small className="text-muted">
            Only JSON files exported from this application are supported. Import will replace all existing data.
          </small>
        </div>
                </div>
    </AnimatedCard>
  );
};

export default DataExportImport;