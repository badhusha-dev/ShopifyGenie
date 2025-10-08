const logger = require('../config/logger');

// Loyalty tier thresholds
const TIER_THRESHOLDS = {
  Bronze: { min: 0, max: 99, discount: 0 },
  Silver: { min: 100, max: 499, discount: 5 },
  Gold: { min: 500, max: 999, discount: 10 },
  Platinum: { min: 1000, max: Infinity, discount: 15 }
};

// Calculate points from sales amount (1 point per $10)
const calculatePoints = (amount) => {
  return Math.floor(amount / 10);
};

// Determine tier based on points
const getTierFromPoints = (points) => {
  if (points >= TIER_THRESHOLDS.Platinum.min) return 'Platinum';
  if (points >= TIER_THRESHOLDS.Gold.min) return 'Gold';
  if (points >= TIER_THRESHOLDS.Silver.min) return 'Silver';
  return 'Bronze';
};

// Check if tier has been upgraded
const checkTierUpgrade = (oldPoints, newPoints) => {
  const oldTier = getTierFromPoints(oldPoints);
  const newTier = getTierFromPoints(newPoints);
  
  if (oldTier !== newTier) {
    return {
      upgraded: true,
      oldTier,
      newTier,
      oldPoints,
      newPoints
    };
  }
  
  return { upgraded: false };
};

// Get discount rate for tier
const getDiscountRate = (tier) => {
  return TIER_THRESHOLDS[tier]?.discount || 0;
};

// Get all tier thresholds
const getAllTiers = () => {
  return Object.keys(TIER_THRESHOLDS).map(tier => ({
    name: tier,
    min_points: TIER_THRESHOLDS[tier].min,
    max_points: TIER_THRESHOLDS[tier].max === Infinity ? null : TIER_THRESHOLDS[tier].max,
    discount_rate: TIER_THRESHOLDS[tier].discount
  }));
};

module.exports = {
  calculatePoints,
  getTierFromPoints,
  checkTierUpgrade,
  getDiscountRate,
  getAllTiers,
  TIER_THRESHOLDS
};
