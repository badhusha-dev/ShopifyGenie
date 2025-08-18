
import { storage } from "./storage";
import type { Customer } from "@shared/schema";

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: TierBenefit[];
  color: string;
  icon: string;
}

export interface TierBenefit {
  type: 'discount' | 'points_multiplier' | 'free_shipping' | 'early_access' | 'exclusive_products';
  value: number;
  description: string;
}

export class TieredLoyaltySystem {
  private tiers: LoyaltyTier[] = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: '#CD7F32',
      icon: 'fas fa-medal',
      benefits: [
        { type: 'points_multiplier', value: 1.0, description: '1x points on all purchases' },
        { type: 'discount', value: 5, description: '5% birthday discount' }
      ]
    },
    {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 2499,
      color: '#C0C0C0',
      icon: 'fas fa-award',
      benefits: [
        { type: 'points_multiplier', value: 1.25, description: '1.25x points on all purchases' },
        { type: 'discount', value: 10, description: '10% member discount' },
        { type: 'free_shipping', value: 1, description: 'Free shipping on orders over $50' }
      ]
    },
    {
      name: 'Gold',
      minPoints: 2500,
      maxPoints: 4999,
      color: '#FFD700',
      icon: 'fas fa-crown',
      benefits: [
        { type: 'points_multiplier', value: 1.5, description: '1.5x points on all purchases' },
        { type: 'discount', value: 15, description: '15% member discount' },
        { type: 'free_shipping', value: 1, description: 'Free shipping on all orders' },
        { type: 'early_access', value: 1, description: '24-hour early access to sales' }
      ]
    },
    {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: Infinity,
      color: '#E5E4E2',
      icon: 'fas fa-gem',
      benefits: [
        { type: 'points_multiplier', value: 2.0, description: '2x points on all purchases' },
        { type: 'discount', value: 20, description: '20% member discount' },
        { type: 'free_shipping', value: 1, description: 'Free shipping + priority handling' },
        { type: 'early_access', value: 1, description: '48-hour early access to sales' },
        { type: 'exclusive_products', value: 1, description: 'Access to exclusive products' }
      ]
    }
  ];

  getTierByPoints(points: number): LoyaltyTier {
    return this.tiers.find(tier => points >= tier.minPoints && points <= tier.maxPoints) || this.tiers[0];
  }

  getNextTier(points: number): LoyaltyTier | null {
    const currentTier = this.getTierByPoints(points);
    const currentIndex = this.tiers.findIndex(tier => tier.name === currentTier.name);
    return currentIndex < this.tiers.length - 1 ? this.tiers[currentIndex + 1] : null;
  }

  getProgressToNextTier(points: number): { current: number; needed: number; percentage: number } {
    const nextTier = this.getNextTier(points);
    if (!nextTier) {
      return { current: points, needed: 0, percentage: 100 };
    }

    const needed = nextTier.minPoints - points;
    const currentTier = this.getTierByPoints(points);
    const tierRange = nextTier.minPoints - currentTier.minPoints;
    const progress = points - currentTier.minPoints;
    const percentage = (progress / tierRange) * 100;

    return {
      current: points,
      needed,
      percentage: Math.min(percentage, 100)
    };
  }

  async getCustomerTierInfo(customerId: string) {
    const customer = await storage.getCustomer(customerId);
    if (!customer) return null;

    const currentTier = this.getTierByPoints(customer.loyaltyPoints);
    const nextTier = this.getNextTier(customer.loyaltyPoints);
    const progress = this.getProgressToNextTier(customer.loyaltyPoints);

    return {
      customer,
      currentTier,
      nextTier,
      progress,
      pointsMultiplier: currentTier.benefits.find(b => b.type === 'points_multiplier')?.value || 1.0
    };
  }

  async applyTierBenefits(customerId: string, orderTotal: number): Promise<{
    discountAmount: number;
    bonusPoints: number;
    freeShipping: boolean;
  }> {
    const tierInfo = await this.getCustomerTierInfo(customerId);
    if (!tierInfo) return { discountAmount: 0, bonusPoints: 0, freeShipping: false };

    const { currentTier } = tierInfo;
    
    // Calculate discount
    const discountBenefit = currentTier.benefits.find(b => b.type === 'discount');
    const discountAmount = discountBenefit ? (orderTotal * discountBenefit.value) / 100 : 0;

    // Calculate bonus points with multiplier
    const pointsMultiplier = currentTier.benefits.find(b => b.type === 'points_multiplier')?.value || 1.0;
    const basePoints = Math.floor(orderTotal);
    const bonusPoints = Math.floor(basePoints * pointsMultiplier) - basePoints;

    // Check free shipping
    const freeShipping = currentTier.benefits.some(b => b.type === 'free_shipping');

    return {
      discountAmount,
      bonusPoints,
      freeShipping
    };
  }

  getAllTiers(): LoyaltyTier[] {
    return this.tiers;
  }

  async getTierDistribution() {
    const customers = await storage.getCustomers();
    const distribution = this.tiers.map(tier => ({
      tier: tier.name,
      count: customers.filter(customer => {
        const customerTier = this.getTierByPoints(customer.loyaltyPoints);
        return customerTier.name === tier.name;
      }).length,
      color: tier.color
    }));

    return distribution;
  }

  // Special tier challenges and promotions
  async createTierChallenge(tierName: string, challenge: {
    name: string;
    description: string;
    target: number;
    reward: number;
    expiryDate: Date;
  }) {
    // Implementation for tier-specific challenges
    // In production, this would be stored in database
    console.log(`Challenge created for ${tierName} tier:`, challenge);
    
    return {
      id: `challenge_${Date.now()}`,
      tierName,
      ...challenge,
      createdAt: new Date()
    };
  }
}

export const loyaltyTiers = new TieredLoyaltySystem();
