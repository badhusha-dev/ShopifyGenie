import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaChartBar, FaDownload, FaFilter, FaExclamationTriangle, FaBoxes, FaWarehouse } from 'react-icons/fa';
import AGDataGrid from '../components/ui/AGDataGrid';
import { ColDef } from 'ag-grid-community';

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: 'in' | 'out';
  quantity: number;
  reference: string;
  referenceType: string;
  performedBy: string;
  createdAt: string;
}

interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  adjustmentType: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  performedBy: string;
  createdAt: string;
}

const InventoryReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('low-stock');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Fetch low stock products
  const { data: lowStockProducts = [], isLoading: loadingLowStock } = useQuery<LowStockProduct[]>({
    queryKey: ['/inventory/reports/low-stock', { threshold: lowStockThreshold }],
    enabled: activeReport === 'low-stock'
  });

  // Fetch stock movements
  const { data: stockMovements = [], isLoading: loadingMovements } = useQuery<StockMovement[]>({
    queryKey: ['/inventory/reports/stock-movements'],
    enabled: activeReport === 'movements'
  });

  // Fetch stock adjustments
  const { data: stockAdjustments = [], isLoading: loadingAdjustments } = useQuery<StockAdjustment[]>({
    queryKey: ['/inventory/reports/stock-adjustments'],
    enabled: activeReport === 'adjustments'
  });

  const lowStockColumns: ColDef[] = [
    { field: 'name', headerName: 'Product Name', flex: 2 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { 
      field: 'stock', 
      headerName: 'Current Stock', 
      flex: 1,
      cellRenderer: (params: any) => {
        const stock = params.value;
        const threshold = params.data.lowStockThreshold;
        const isLow = stock <= threshold;
        return `<span class="badge ${isLow ? 'bg-warning text-dark' : 'bg-success'}">${stock}</span>`;
      }
    },
    { field: 'lowStockThreshold', headerName: 'Threshold', flex: 1 },
    { 
      field: 'price', 
      headerName: 'Price', 
      flex: 1,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`
    }
  ];

  const movementsColumns: ColDef[] = [
    { field: 'productName', headerName: 'Product', flex: 2 },
    { 
      field: 'movementType', 
      headerName: 'Type', 
      flex: 1,
      cellRenderer: (params: any) => {
        const type = params.value;
        return `<span class="badge ${type === 'in' ? 'bg-success' : 'bg-danger'}">${type.toUpperCase()}</span>`;
      }
    },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'reference', headerName: 'Reference', flex: 1 },
    { field: 'referenceType', headerName: 'Reference Type', flex: 1 },
    { field: 'performedBy', headerName: 'Performed By', flex: 1 },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      flex: 1,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    }
  ];

  const adjustmentsColumns: ColDef[] = [
    { field: 'productName', headerName: 'Product', flex: 2 },
    { 
      field: 'adjustmentType', 
      headerName: 'Type', 
      flex: 1,
      cellRenderer: (params: any) => {
        const type = params.value;
        const color = type === 'add' ? 'success' : type === 'remove' ? 'danger' : 'info';
        return `<span class="badge bg-${color}">${type.toUpperCase()}</span>`;
      }
    },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'reason', headerName: 'Reason', flex: 2 },
    { field: 'previousStock', headerName: 'Previous', flex: 1 },
    { field: 'newStock', headerName: 'New Stock', flex: 1 },
    { field: 'performedBy', headerName: 'Performed By', flex: 1 },
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      flex: 1,
      cellRenderer: (params: any) => new Date(params.value).toLocaleDateString()
    }
  ];

  const getCurrentData = () => {
    switch (activeReport) {
      case 'low-stock':
        return { data: lowStockProducts, columns: lowStockColumns, loading: loadingLowStock };
      case 'movements':
        return { data: stockMovements, columns: movementsColumns, loading: loadingMovements };
      case 'adjustments':
        return { data: stockAdjustments, columns: adjustmentsColumns, loading: loadingAdjustments };
      default:
        return { data: [], columns: [], loading: false };
    }
  };

  const { data, columns, loading } = getCurrentData();

  return (
    <div className="container-fluid animate-fade-in-up">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h3 fw-bold text-dark mb-2">
                <FaChartBar className="me-2 text-primary" />
                Inventory Reports
              </h1>
              <p className="text-muted mb-0">Comprehensive inventory analytics and reports</p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary d-flex align-items-center">
                <FaDownload className="me-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="modern-card p-4">
            <ul className="nav nav-pills" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeReport === 'low-stock' ? 'active' : ''}`}
                  onClick={() => setActiveReport('low-stock')}
                >
                  <FaExclamationTriangle className="me-2" />
                  Low Stock Alert
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeReport === 'movements' ? 'active' : ''}`}
                  onClick={() => setActiveReport('movements')}
                >
                  <FaWarehouse className="me-2" />
                  Stock Movements
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeReport === 'adjustments' ? 'active' : ''}`}
                  onClick={() => setActiveReport('adjustments')}
                >
                  <FaBoxes className="me-2" />
                  Stock Adjustments
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeReport === 'low-stock' && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="modern-card p-4">
              <div className="row g-3 align-items-center">
                <div className="col-md-6">
                  <label htmlFor="threshold" className="form-label fw-semibold">
                    <FaFilter className="me-2" />
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="threshold"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                    min="1"
                  />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <span className="badge bg-info-subtle text-info px-3 py-2">
                    {data.length} products below threshold
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Data */}
      <div className="row">
        <div className="col-12">
          <div className="modern-card">
            <AGDataGrid
              rowData={data}
              columnDefs={columns}
              loading={loading}
              pagination={true}
              paginationPageSize={25}
              height="600px"
              enableExport={true}
              exportFileName={`inventory-${activeReport}-report`}
              showExportButtons={true}
              enableFiltering={true}
              enableSorting={true}
              enableResizing={true}
              sideBar={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
