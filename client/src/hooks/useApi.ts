import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, AuthRequest, AuthResponse, ShopifyConfigRequest, ShopifyConfig, Customer, Product, Order } from '../lib/api';

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, AuthRequest>({
    mutationFn: (credentials) => apiClient.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AuthResponse, Error, AuthRequest>({
    mutationFn: (credentials) => apiClient.register(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      apiClient.logout();
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// Shopify Configuration hooks
export const useShopifyConfigs = () => {
  return useQuery<ShopifyConfig[]>({
    queryKey: ['shopify-configs'],
    queryFn: () => apiClient.getShopifyConfigs(),
    enabled: apiClient.isAuthenticated(),
  });
};

export const useShopifyConfig = (id: number) => {
  return useQuery<ShopifyConfig>({
    queryKey: ['shopify-config', id],
    queryFn: () => apiClient.getShopifyConfig(id),
    enabled: !!id && apiClient.isAuthenticated(),
  });
};

export const useSaveShopifyConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ShopifyConfig, Error, ShopifyConfigRequest>({
    mutationFn: (config) => apiClient.saveShopifyConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-configs'] });
    },
  });
};

export const useUpdateShopifyConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ShopifyConfig, Error, { id: number; config: ShopifyConfigRequest }>({
    mutationFn: ({ id, config }) => apiClient.updateShopifyConfig(id, config),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-configs'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-config', id] });
    },
  });
};

export const useDeleteShopifyConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient.deleteShopifyConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopify-configs'] });
    },
  });
};

// Customer hooks
export const useCustomers = () => {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => apiClient.getCustomers(),
    enabled: apiClient.isAuthenticated(),
  });
};

export const useCustomer = (id: number) => {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => apiClient.getCustomer(id),
    enabled: !!id && apiClient.isAuthenticated(),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, Partial<Customer>>({
    mutationFn: (customer) => apiClient.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Customer, Error, { id: number; customer: Partial<Customer> }>({
    mutationFn: ({ id, customer }) => apiClient.updateCustomer(id, customer),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Product hooks
export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
    enabled: apiClient.isAuthenticated(),
  });
};

export const useProduct = (id: number) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id && apiClient.isAuthenticated(),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: (product) => apiClient.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Product, Error, { id: number; product: Partial<Product> }>({
    mutationFn: ({ id, product }) => apiClient.updateProduct(id, product),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Order hooks
export const useOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
    enabled: apiClient.isAuthenticated(),
  });
};

export const useOrder = (id: number) => {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id && apiClient.isAuthenticated(),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, Partial<Order>>({
    mutationFn: (order) => apiClient.createOrder(order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Order, Error, { id: number; order: Partial<Order> }>({
    mutationFn: ({ id, order }) => apiClient.updateOrder(id, order),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
