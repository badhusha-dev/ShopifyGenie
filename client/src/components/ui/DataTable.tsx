
import React, { useState } from 'react';
import { designTokens } from '../../design/tokens';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  expandable?: boolean;
  renderExpandedRow?: (row: any) => React.ReactNode;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  expandable = false,
  renderExpandedRow,
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = ''
}) => {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: string) => {
    if (!onSort) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  const isRowExpanded = (rowId: string) => expandedRows.has(rowId);

  if (loading) {
    return (
      <div className={`table-responsive ${className}`}>
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              {expandable && <th style={{ width: '50px' }}></th>}
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  <div className="placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                {expandable && <td></td>}
                {columns.map((column) => (
                  <td key={column.key}>
                    <div className="placeholder-glow">
                      <span className="placeholder col-10"></span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
        <p className="text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`table-responsive ${className}`}>
        <table className="table table-hover modern-table">
          <thead className="table-light">
            <tr>
              {expandable && (
                <th style={{ width: '50px' }} className="text-center">
                  <i className="fas fa-expand-arrows-alt text-muted"></i>
                </th>
              )}
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  style={{ width: column.width }}
                  className={column.sortable ? 'sortable-header' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="fw-semibold">{column.label}</span>
                    {column.sortable && (
                      <i className={`fas ${
                        sortKey === column.key 
                          ? sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                          : 'fa-sort'
                      } text-muted ms-2`}></i>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.filter(row => row).map((row, index) => {
              const rowId = row?.id || index.toString();
              const isExpanded = isRowExpanded(rowId);
              
              return (
                <React.Fragment key={rowId}>
                  <tr className={`table-row ${isExpanded ? 'expanded' : ''}`}>
                    {expandable && (
                      <td className="text-center">
                        <button
                          className="btn btn-link btn-sm p-0 btn-ripple"
                          onClick={() => toggleRowExpansion(rowId)}
                          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                        >
                          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-muted`}></i>
                        </button>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                  {expandable && isExpanded && renderExpandedRow && (
                    <tr className="expanded-row">
                      <td colSpan={columns.length + 1} className="p-0">
                        <div className="row-expand-content">
                          {renderExpandedRow(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

    </>
  );
};

export default DataTable;
