import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { ApiVersion } from '@shopify/shopify-api';

// Initialize Shopify API only if credentials are provided
let shopify: any = null;
if (process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET) {
  try {
    shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET,
      scopes: (process.env.SHOPIFY_SCOPES || 'read_products,read_customers,read_orders').split(','),
      hostName: process.env.SHOPIFY_APP_URL?.replace('https://', '') || 'localhost',
      apiVersion: LATEST_API_VERSION as ApiVersion,
      isEmbeddedApp: true,
    });
  } catch (error) {
    console.warn('Shopify API not initialized:', error);
  }
}

// Store for shop sessions (in memory for demo)
const shopSessions = new Map<string, any>();

export { shopify, shopSessions };

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: string;
  variants: {
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku: string;
    inventory_quantity: number;
    inventory_management: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  tags: string;
  state: string;
}

export interface ShopifyOrder {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: {
    id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    product_id: number;
    sku: string;
  }[];
}

export class ShopifyService {
  private session: any;

  constructor(shopDomain: string) {
    if (!shopify) {
      throw new Error('Shopify API not initialized. Please configure SHOPIFY_API_KEY and SHOPIFY_API_SECRET.');
    }
    this.session = shopSessions.get(shopDomain);
    if (!this.session) {
      throw new Error(`No session found for shop: ${shopDomain}`);
    }
  }

  async getProducts(): Promise<ShopifyProduct[]> {
    try {
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'products',
        query: { limit: 250 }
      });
      return response.body.products || [];
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
      return [];
    }
  }

  async getCustomers(): Promise<ShopifyCustomer[]> {
    try {
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'customers',
        query: { limit: 250 }
      });
      return response.body.customers || [];
    } catch (error) {
      console.error('Error fetching customers from Shopify:', error);
      return [];
    }
  }

  async getOrders(): Promise<ShopifyOrder[]> {
    try {
      const client = new shopify.clients.Rest({ session: this.session });
      const response = await client.get({
        path: 'orders',
        query: { limit: 250, status: 'any' }
      });
      return response.body.orders || [];
    } catch (error) {
      console.error('Error fetching orders from Shopify:', error);
      return [];
    }
  }

  async updateProductInventory(variantId: number, quantity: number): Promise<boolean> {
    try {
      const client = new shopify.clients.Rest({ session: this.session });
      await client.put({
        path: `variants/${variantId}`,
        data: {
          variant: {
            id: variantId,
            inventory_quantity: quantity
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Error updating inventory in Shopify:', error);
      return false;
    }
  }
}

export function saveShopSession(shopDomain: string, accessToken: string) {
  const session = {
    shop: shopDomain,
    accessToken: accessToken,
    id: `offline_${shopDomain}`,
    isOnline: false,
  };
  shopSessions.set(shopDomain, session);
}

export function getShopSession(shopDomain: string) {
  return shopSessions.get(shopDomain);
}