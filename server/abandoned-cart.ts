
import { storage } from "./storage";
import type { Customer } from "@shared/schema";

export interface AbandonedCart {
  id: string;
  customerId: string;
  items: CartItem[];
  totalValue: number;
  createdAt: Date;
  lastUpdated: Date;
  recoveryAttempts: number;
  recovered: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: string;
  productName: string;
}

export class AbandonedCartService {
  private carts: Map<string, AbandonedCart> = new Map();

  // Track cart abandonment (called from frontend)
  async trackAbandonedCart(customerId: string, items: CartItem[]) {
    const cartId = `cart_${customerId}_${Date.now()}`;
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const abandonedCart: AbandonedCart = {
      id: cartId,
      customerId,
      items,
      totalValue,
      createdAt: new Date(),
      lastUpdated: new Date(),
      recoveryAttempts: 0,
      recovered: false
    };

    this.carts.set(cartId, abandonedCart);
    
    // Schedule recovery emails
    this.scheduleRecoveryEmails(cartId);
    
    return abandonedCart;
  }

  private async scheduleRecoveryEmails(cartId: string) {
    // In production, you'd use a job queue like Bull or Agenda
    // For demo, we'll simulate with setTimeout
    
    // First email after 1 hour
    setTimeout(() => this.sendRecoveryEmail(cartId, 1), 60 * 60 * 1000);
    
    // Second email after 24 hours with loyalty bonus
    setTimeout(() => this.sendRecoveryEmail(cartId, 2), 24 * 60 * 60 * 1000);
    
    // Final email after 3 days with bigger incentive
    setTimeout(() => this.sendRecoveryEmail(cartId, 3), 3 * 24 * 60 * 60 * 1000);
  }

  async sendRecoveryEmail(cartId: string, attempt: number) {
    const cart = this.carts.get(cartId);
    if (!cart || cart.recovered) return;

    const customer = await storage.getCustomer(cart.customerId);
    if (!customer) return;

    cart.recoveryAttempts = attempt;
    cart.lastUpdated = new Date();

    const incentives = {
      1: { discount: 5, bonusPoints: 50, message: "You left something behind!" },
      2: { discount: 10, bonusPoints: 100, message: "Don't miss out! Extra points inside" },
      3: { discount: 15, bonusPoints: 200, message: "Last chance - exclusive offer!" }
    };

    const incentive = incentives[attempt as keyof typeof incentives];

    // In production, integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`📧 Recovery Email ${attempt} sent to ${customer.email}`);
    console.log(`Cart ID: ${cartId}`);
    console.log(`Incentive: ${incentive.discount}% off + ${incentive.bonusPoints} bonus points`);
    console.log(`Items: ${cart.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}`);

    // Create a loyalty bonus for the customer
    await storage.createLoyaltyTransaction({
      customerId: customer.id,
      points: incentive.bonusPoints,
      type: 'earned',
      description: `Cart recovery bonus - ${incentive.message}`
    });

    // Update customer points
    await storage.updateCustomer(customer.id, {
      loyaltyPoints: customer.loyaltyPoints + incentive.bonusPoints
    });

    return {
      success: true,
      emailData: {
        to: customer.email,
        subject: incentive.message,
        discount: incentive.discount,
        bonusPoints: incentive.bonusPoints,
        cartValue: cart.totalValue,
        items: cart.items
      }
    };
  }

  async markCartRecovered(cartId: string) {
    const cart = this.carts.get(cartId);
    if (cart) {
      cart.recovered = true;
      cart.lastUpdated = new Date();
    }
  }

  async getAbandonedCarts(): Promise<AbandonedCart[]> {
    return Array.from(this.carts.values())
      .filter(cart => !cart.recovered)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }

  async getRecoveryStats() {
    const allCarts = Array.from(this.carts.values());
    const recovered = allCarts.filter(cart => cart.recovered);
    const totalValue = allCarts.reduce((sum, cart) => sum + cart.totalValue, 0);
    const recoveredValue = recovered.reduce((sum, cart) => sum + cart.totalValue, 0);

    return {
      totalAbandoned: allCarts.length,
      totalRecovered: recovered.length,
      recoveryRate: allCarts.length > 0 ? (recovered.length / allCarts.length) * 100 : 0,
      totalValue,
      recoveredValue,
      potentialRevenue: totalValue - recoveredValue
    };
  }
}

export const abandonedCartService = new AbandonedCartService();
