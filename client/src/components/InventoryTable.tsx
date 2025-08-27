import React, { useMemo } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";
import { ColDef } from 'ag-grid-community';
import AGDataGrid from './ui/AGDataGrid';

const InventoryTable = () => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Product',
      field: 'name',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const product = params.data;
        return `
          <div class="d-flex align-items-center">
            <div class="me-2">
              <div class="bg-light rounded" style="width: 40px; height: 40px;"></div>
            </div>
            <div>
              <div class="fw-semibold">${product.name}</div>
              <small class="text-muted">${product.category || ''}</small>
            </div>
          </div>
        `;
      },
      minWidth: 250
    },
    {
      headerName: 'SKU',
      field: 'sku',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => `<code>${params.value || 'N/A'}</code>`,
      minWidth: 120
    },
    {
      headerName: 'Stock',
      field: 'stock',
      sortable: true,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => {
        const stock = params.value;
        const textClass = stock < 10 ? 'text-danger' : 'text-success';
        return `<span class="fw-semibold ${textClass}">${stock}</span>`;
      },
      minWidth: 100
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const stock = params.data.stock;
        const status = getStockStatus(stock);
        return `<span class="badge ${status.class}">${status.label}</span>`;
      },
      minWidth: 120
    },
    {
      headerName: 'Last Updated',
      field: 'lastUpdated',
      sortable: true,
      filter: 'agDateColumnFilter',
      cellRenderer: (params: any) => {
        return `<small class="text-muted">${formatDate(params.value)}</small>`;
      },
      minWidth: 150
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const product = params.data;
        return `
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-info" onclick="viewProduct('${product.id}')">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        `;
      },
      minWidth: 120,
      pinned: 'right'
    }
  ], []);

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/shopify/sync"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const getStockStatus = (stock: number) => {
    if (stock < 5) return { label: "Out of Stock", class: "bg-danger" };
    if (stock < 10) return { label: "Low Stock", class: "badge-low-stock" };
    return { label: "In Stock", class: "bg-success" };
  };

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).editProduct = (productId: string) => {
      console.log('Edit product:', productId);
      // Add edit functionality
    };
    (window as any).viewProduct = (productId: string) => {
      console.log('View product:', productId);
      // Add view functionality
    };
  }, []);

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-8"></span>
            <span className="placeholder col-6"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Inventory Status</h6>
        <div>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            <i className={`fas fa-sync me-1 ${syncMutation.isPending ? "fa-spin" : ""}`}></i>
            Sync with Shopify
          </button>
        </div>
      </div>
      <div className="card-body p-3">
        <AGDataGrid
          rowData={products || []}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={20}
          height="500px"
          enableExport={true}
          exportFileName="inventory"
          showExportButtons={true}
          enableFiltering={true}
          enableSorting={true}
          enableResizing={true}
        />
      </div>
    </div>
  );
};

export default InventoryTable;
