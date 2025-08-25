import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hover?: boolean;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  pageSize = 10,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  striped = true,
  hover = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter((row) => {
      return columns.some((column) => {
        const value = row[column.key as keyof T];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted small">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </li>
          {pages.map((page) => (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="modern-card">
        <div className="table-responsive">
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>
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
                  {columns.map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`data-table-container ${className}`}>
        {searchable && (
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="position-relative">
                <i className="fas fa-search position-absolute text-muted search-icon"></i>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <span className="text-muted small">
                {sortedData.length} result{sortedData.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        <div className="modern-card">
          <div className="table-responsive">
            <table className={`table modern-table mb-0 ${striped ? 'table-striped' : ''} ${hover ? 'table-hover' : ''}`}>
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      style={{ 
                        width: column.width,
                        textAlign: column.align || 'left',
                        cursor: column.sortable ? 'pointer' : 'default'
                      }}
                      onClick={() => column.sortable && handleSort(column.key as string)}
                      className={column.sortable ? 'sortable-header' : ''}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <div className="sort-icons">
                            <i className={`fas fa-sort${
                              sortConfig?.key === column.key
                                ? sortConfig.direction === 'asc'
                                  ? '-up'
                                  : '-down'
                                : ''
                            } text-muted`}></i>
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-5 text-muted">
                      <i className="fas fa-inbox mb-3" style={{fontSize: '3rem'}}></i>
                      <div>{emptyMessage}</div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="table-row">
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          style={{ textAlign: column.align || 'left' }}
                        >
                          {column.render
                            ? column.render(row[column.key as keyof T], row, rowIndex)
                            : String(row[column.key as keyof T] || '')
                          }
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      </div>

      {/* Embedded styles */}
      <style jsx>{`
        .search-icon {
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
        }

        .sortable-header {
          transition: all 0.2s ease;
        }

        .sortable-header:hover {
          background-color: var(--shopify-green-light) !important;
          color: var(--shopify-green) !important;
        }

        .sort-icons {
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        .sortable-header:hover .sort-icons {
          opacity: 1;
        }

        .table-row {
          transition: all 0.2s ease;
        }

        .table-row:hover {
          background-color: var(--shopify-green-light) !important;
        }

        .pagination .page-link {
          border-radius: 8px;
          margin: 0 2px;
          border: 1px solid #dee2e6;
          color: var(--shopify-green);
        }

        .pagination .page-link:hover {
          background-color: var(--shopify-green-light);
          border-color: var(--shopify-green);
        }

        .pagination .page-item.active .page-link {
          background-color: var(--shopify-green);
          border-color: var(--shopify-green);
        }

        .pagination .page-item.disabled .page-link {
          color: #6c757d;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}

export default DataTable;