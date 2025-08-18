
import type { Customer, Product, Order } from "@shared/schema";
import { storage } from "./storage";

export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  product: Product;
}

export class AIRecommendationEngine {
  // Calculate customer purchase patterns and preferences
  async getCustomerProfile(customerId: string) {
    const orders = await storage.getOrdersByCustomer(customerId);
    const customer = await storage.getCustomer(customerId);
    
    if (!customer) return null;

    // Analyze purchase frequency, categories, price ranges
    const purchaseHistory = {
      totalOrders: orders.length,
      avgOrderValue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0) / orders.length,
      loyaltyTier: this.calculateLoyaltyTier(customer.loyaltyPoints),
      preferredCategories: await this.getPreferredCategories(orders),
      lastPurchaseDate: orders.length > 0 ? Math.max(...orders.map(o => new Date(o.createdAt).getTime())) : 0
    };

    return { customer, purchaseHistory };
  }

  calculateLoyaltyTier(points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' {
    if (points >= 5000) return 'Platinum';
    if (points >= 2500) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  }

  async getPreferredCategories(orders: Order[]): Promise<{ [category: string]: number }> {
    const categories: { [key: string]: number } = {};
    
    // In a real implementation, you'd track order line items
    // For demo, we'll simulate based on order patterns
    const products = await storage.getProducts();
    
    products.forEach(product => {
      if (product.category) {
        categories[product.category] = (categories[product.category] || 0) + 1;
      }
    });

    return categories;
  }

  async generateRecommendations(customerId: string, limit = 5): Promise<ProductRecommendation[]> {
    const profile = await this.getCustomerProfile(customerId);
    if (!profile) return [];

    const allProducts = await storage.getProducts();
    const recommendations: ProductRecommendation[] = [];

    for (const product of allProducts) {
      const score = this.calculateRecommendationScore(product, profile);
      
      if (score > 0.3) { // Threshold for recommendations
        recommendations.push({
          productId: product.id,
          score,
          reason: this.generateRecommendationReason(product, profile),
          product
        });
      }
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateRecommendationScore(product: Product, profile: any): number {
    let score = 0.5; // Base score

    // Category preference boost
    if (profile.purchaseHistory.preferredCategories[product.category || '']) {
      score += 0.3;
    }

    // Price range compatibility
    const productPrice = parseFloat(product.price || '0');
    const avgOrderValue = profile.purchaseHistory.avgOrderValue || 0;
    
    if (productPrice <= avgOrderValue * 1.2) {
      score += 0.2;
    }

    // Loyalty tier bonuses
    const tierMultiplier = {
      'Bronze': 1.0,
      'Silver': 1.1,
      'Gold': 1.2,
      'Platinum': 1.3
    };
    
    score *= tierMultiplier[profile.purchaseHistory.loyaltyTier];

    // Stock availability
    if (product.stock > 0) {
      score += 0.1;
    } else {
      score *= 0.3; // Heavily penalize out-of-stock
    }

    return Math.min(score, 1.0);
  }

  private generateRecommendationReason(product: Product, profile: any): string {
    const reasons = [];
    
    if (profile.purchaseHistory.preferredCategories[product.category || '']) {
      reasons.push(`Popular in ${product.category}`);
    }
    
    if (profile.purchaseHistory.loyaltyTier !== 'Bronze') {
      reasons.push(`${profile.purchaseHistory.loyaltyTier} member exclusive`);
    }
    
    if (product.stock < 10) {
      reasons.push('Limited stock');
    }

    return reasons.join(' • ') || 'Recommended for you';
  }

  // Batch recommendations for multiple customers (for email campaigns)
  async generateBatchRecommendations(customerIds: string[]) {
    const batchResults = [];
    
    for (const customerId of customerIds) {
      const recommendations = await this.generateRecommendations(customerId, 3);
      batchResults.push({
        customerId,
        recommendations
      });
    }
    
    return batchResults;
  }
}

export const aiRecommendations = new AIRecommendationEngine();
