import { useQuery } from "@tanstack/react-query";
import type { Subscription, Customer, Product } from "@shared/schema";

const SubscriptionList = () => {
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="fas fa-sync-alt me-2"></i>
          Active Subscriptions
        </h6>
      </div>
      <div className="card-body">
        {subscriptions?.map((subscription) => (
          <div
            key={subscription.id}
            className="d-flex justify-content-between align-items-center py-2 border-bottom"
          >
            <div>
              <div className="fw-semibold">{getProductName(subscription.productId)}</div>
              <small className="text-muted">
                {getCustomerName(subscription.customerId)} - Next delivery:{" "}
                {formatDate(subscription.nextDelivery)}
              </small>
            </div>
            <div>
              <span className={`badge ${getStatusBadge(subscription.status)} me-2`}>
                {subscription.status}
              </span>
              <div className="btn-group btn-group-sm">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-edit"></i>
                </button>
                {subscription.status === "active" ? (
                  <button className="btn btn-outline-warning">
                    <i className="fas fa-pause"></i>
                  </button>
                ) : (
                  <button className="btn btn-outline-success">
                    <i className="fas fa-play"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-3">
          <button className="btn btn-primary btn-sm">
            <i className="fas fa-plus me-1"></i>
            Add New Subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionList;
