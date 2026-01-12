import { Cart } from '../types/cart';

/**
 * Calculate total weight of cart in KG.
 * Medusa weights are typically in grams, but can vary.
 * Based on web logic: assumes grams if > 0, returns kg.
 */
export function getCartWeightKg(cart?: Cart | null): number {
  if (!cart?.items?.length) return 0;

  const totalWeightGrams = cart.items.reduce((acc, item) => {
    // Try to find weight in various places
    const weightVal = 
      item.variant?.weight || 
      (item.variant?.product as any)?.weight || 
      0;
      
    const weightNum = Number(weightVal) || 0;
    return acc + (weightNum * item.quantity);
  }, 0);

  // If total weight is 0, backend might default to 1kg minimum for calculation
  if (totalWeightGrams === 0) return 1;

  return totalWeightGrams / 1000;
}
