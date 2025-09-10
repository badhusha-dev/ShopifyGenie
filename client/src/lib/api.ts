// API Configuration and Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
}

export interface ShopifyConfigRequest {
  shopDomain: string;
  accessToken: string;
  webhookSecret?: string;
}

export interface ShopifyConfig {
  id: number;
  shopDomain: string;
  accessToken: string;
  webhookSecret?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  price: number;
  sku?: string;
  inventoryQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like DELETE requests)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Shopify Configuration methods
  async getShopifyConfigs(): Promise<ShopifyConfig[]> {
    return this.request<ShopifyConfig[]>('/config/shopify');
  }

  async getShopifyConfig(id: number): Promise<ShopifyConfig> {
    return this.request<ShopifyConfig>(`/config/shopify/${id}`);
  }

  async saveShopifyConfig(config: ShopifyConfigRequest): Promise<ShopifyConfig> {
    return this.request<ShopifyConfig>('/config/shopify', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateShopifyConfig(id: number, config: ShopifyConfigRequest): Promise<ShopifyConfig> {
    return this.request<ShopifyConfig>(`/config/shopify/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteShopifyConfig(id: number): Promise<void> {
    return this.request<void>(`/config/shopify/${id}`, {
      method: 'DELETE',
    });
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>('/customers');
  }

  async getCustomer(id: number): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`);
  }

  async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    return this.request<void>(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: number): Promise<void> {
    return this.request<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
