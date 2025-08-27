import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { FaFileExport, FaFileExcel, FaFileCsv, FaFilePdf, FaDownload } from 'react-icons/fa';

interface AGDataGridProps {
  rowData: any[];
  columnDefs: ColDef[];
  loading?: boolean;
  pagination?: boolean;
  paginationPageSize?: number;
  onRowClicked?: (event: CellClickedEvent) => void;
  onRowDoubleClicked?: (event: CellClickedEvent) => void;
  height?: string;
  className?: string;
  enableExport?: boolean;
  exportFileName?: string;
  showExportButtons?: boolean;
  gridOptions?: any;
  onGridReady?: (event: GridReadyEvent) => void;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enableResizing?: boolean;
  sideBar?: boolean;
  autoSizeColumns?: boolean;
  suppressColumnVirtualisation?: boolean;
  suppressRowVirtualisation?: boolean;
  rowSelection?: 'single' | 'multiple';
  enableRangeSelection?: boolean;
  rowMultiSelectWithClick?: boolean;
}

const AGDataGrid: React.FC<AGDataGridProps> = ({
  rowData,
  columnDefs,
  loading = false,
  pagination = true,
  paginationPageSize = 25,
  onRowClicked,
  onRowDoubleClicked,
  height = '500px',
  className = '',
  enableExport = true,
  exportFileName = 'data',
  showExportButtons = true,
  gridOptions = {},
  onGridReady,
  enableFiltering = true,
  enableSorting = true,
  enableResizing = true,
  sideBar = false,
  autoSizeColumns = true,
  suppressColumnVirtualisation = false,
  suppressRowVirtualisation = false,
  rowSelection = 'single',
  enableRangeSelection = true,
  rowMultiSelectWithClick = false
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const gridApiRef = useRef<GridApi | null>(null);

  const defaultColDef = useMemo(() => ({
    sortable: enableSorting,
    filter: enableFiltering,
    resizable: enableResizing,
    floatingFilter: enableFiltering,
    flex: 1,
    minWidth: 100,
    cellClass: 'ag-cell-center',
    headerClass: 'ag-header-center'
  }), [enableSorting, enableFiltering, enableResizing]);

  const onGridReadyCallback = useCallback((event: GridReadyEvent) => {
    gridApiRef.current = event.api;
    if (autoSizeColumns) {
      setTimeout(() => {
        event.api.sizeColumnsToFit();
      }, 100);
    }
    if (onGridReady) {
      onGridReady(event);
    }
  }, [onGridReady, autoSizeColumns]);

  // Export functions
  const exportToCSV = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({
        fileName: `${exportFileName}.csv`,
        columnSeparator: ',',
      });
    }
  }, [exportFileName]);

  const exportToExcel = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsExcel({
        fileName: `${exportFileName}.xlsx`,
      });
    }
  }, [exportFileName]);

  const exportToPDF = useCallback(() => {
    // Note: PDF export requires ag-grid-enterprise license
    console.warn('PDF export requires AG-Grid Enterprise license');
    // Fallback to CSV export
    exportToCSV();
  }, [exportToCSV]);

  const exportToJSON = useCallback(() => {
    if (gridApiRef.current) {
      const allRowData: any[] = [];
      gridApiRef.current.forEachNodeAfterFilterAndSort((node) => {
        allRowData.push(node.data);
      });
      
      const dataStr = JSON.stringify(allRowData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportFileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [exportFileName]);

  return (
    <div className={`ag-data-grid-container ${className}`}>
      {showExportButtons && enableExport && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <FaDownload className="text-muted me-2" />
            <span className="text-muted small">Export Options:</span>
          </div>
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={exportToCSV}
              title="Export to CSV"
              data-testid="export-csv"
            >
              <FaFileCsv className="me-1" />
              CSV
            </button>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={exportToExcel}
              title="Export to Excel"
              data-testid="export-excel"
            >
              <FaFileExcel className="me-1" />
              Excel
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={exportToJSON}
              title="Export to JSON"
              data-testid="export-json"
            >
              <FaFileExport className="me-1" />
              JSON
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={exportToPDF}
              title="Export to PDF (CSV fallback)"
              data-testid="export-pdf"
            >
              <FaFilePdf className="me-1" />
              PDF
            </button>
          </div>
        </div>
      )}

      <div 
        className="ag-theme-alpine" 
        style={{ height, width: '100%' }}
      >
        {loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onGridReady={onGridReadyCallback}
          suppressRowClickSelection={false}
          rowSelection={rowSelection}
          rowMultiSelectWithClick={rowMultiSelectWithClick}
          animateRows={true}
          sideBar={sideBar}
          enableRangeSelection={enableRangeSelection}
          suppressColumnVirtualisation={suppressColumnVirtualisation}
          suppressRowVirtualisation={suppressRowVirtualisation}
          onFirstDataRendered={(params) => {
            if (autoSizeColumns) {
              params.api.sizeColumnsToFit();
            }
          }}
          {...gridOptions}
        />
      </div>
    </div>
  );
};

export default AGDataGrid;