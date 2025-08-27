import React, { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { FaFileExport, FaFileExcel, FaFileCsv, FaFilePdf } from 'react-icons/fa';

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
  sideBar = false
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
  }), [enableSorting, enableFiltering, enableResizing]);

  const onGridReadyCallback = useCallback((event: GridReadyEvent) => {
    gridApiRef.current = event.api;
    if (onGridReady) {
      onGridReady(event);
    }
  }, [onGridReady]);

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
        <div className="d-flex justify-content-end mb-3 gap-2">
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
          rowSelection="single"
          animateRows={true}
          sideBar={sideBar}
          enableRangeSelection={true}
          suppressColumnVirtualisation={false}
          suppressRowVirtualisation={false}
          {...gridOptions}
        />
      </div>
    </div>
  );
};

export default AGDataGrid;