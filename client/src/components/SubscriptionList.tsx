import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import type { Subscription, Customer, Product } from "@shared/schema";
import { ColDef } from 'ag-grid-community';
import AGDataGrid from './ui/AGDataGrid';

const SubscriptionList = () => {
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/subscriptions"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/products"],
  });

  const getCustomerName = (customerId: string | null) => {
    if (!customerId || !customers) return "Unknown Customer";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Unknown Customer";
  };

  const getProductName = (productId: string | null) => {
    if (!productId || !products) return "Unknown Product";
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "paused":
        return "bg-warning text-dark";
      case "cancelled":
        return "bg-danger";
      default:
        return "bg-secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-8"></span>
          </div>
        </div>
      </div>
    );
  }

  // AG-Grid Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: 'Product',
      field: 'productId',
      sortable: true,
      filter: true,
      valueGetter: (params) => getProductName(params.data?.productId),
      minWidth: 200
    },
    {
      headerName: 'Customer',
      field: 'customerId',
      sortable: true,
      filter: true,
      valueGetter: (params) => getCustomerName(params.data?.customerId),
      minWidth: 180
    },
    {
      headerName: 'Status',
      field: 'status',
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        const badgeClass = getStatusBadge(status);
        return `<span class="badge ${badgeClass}">${status}</span>`;
      },
      minWidth: 120
    },
    {
      headerName: 'Next Delivery',
      field: 'nextDelivery',
      sortable: true,
      filter: 'agDateColumnFilter',
      valueGetter: (params) => formatDate(params.data?.nextDelivery),
      minWidth: 150
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => {
        const subscription = params.data;
        const isActive = subscription.status === 'active';
        return `
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="editSubscription('${subscription.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-outline-${isActive ? 'warning' : 'success'}" onclick="toggleSubscription('${subscription.id}')">
              <i class="fas fa-${isActive ? 'pause' : 'play'}"></i>
            </button>
          </div>
        `;
      },
      minWidth: 120,
      pinned: 'right'
    }
  ], [customers, products]);

  // Add window functions for AG-Grid action buttons
  React.useEffect(() => {
    (window as any).editSubscription = (subscriptionId: string) => {
      console.log('Edit subscription:', subscriptionId);
    };
    (window as any).toggleSubscription = (subscriptionId: string) => {
      console.log('Toggle subscription:', subscriptionId);
    };
  }, []);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fas fa-sync-alt me-2"></i>
          Active Subscriptions
        </h6>
        <button className="btn btn-primary btn-sm">
          <i className="fas fa-plus me-1"></i>
          Add New Subscription
        </button>
      </div>
      <div className="card-body p-3">
        <AGDataGrid
          rowData={subscriptions || []}
          columnDefs={columnDefs}
          loading={isLoading}
          pagination={true}
          paginationPageSize={15}
          height="400px"
          enableExport={true}
          exportFileName="subscriptions"
          showExportButtons={true}
          enableFiltering={true}
          enableSorting={true}
          enableResizing={true}
        />
      </div>
    </div>
  );
};

export default SubscriptionList;
