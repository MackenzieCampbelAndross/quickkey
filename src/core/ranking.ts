/**
 * Search ranking engine combining fuzzy match quality, execution frequency,
 * recency decay, and favorite weighting.
 */

import { CommandItem } from '../types';

export class RankingEngine {
  private static RECENCY_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Calculates a score multiplier based on past interactions.
   */
  static computeMultiplier(item: CommandItem): number {
    const usageCount = item.usageCount || 0;
    const lastUsed = item.lastUsed || 0;
    const isFavorite = !!item.isFavorite;

    // 1. Frequency bonus: logarithmic scaling so popular items get a strong boost without starving new matches
    const frequencyMultiplier = 1.0 + Math.log2(1 + usageCount) * 0.35;

    // 2. Recency decay bonus: higher boost if used recently (exponential decay)
    let recencyMultiplier = 1.0;
    if (lastUsed > 0) {
      const elapsedMs = Math.max(0, Date.now() - lastUsed);
      const decay = Math.pow(0.5, elapsedMs / this.RECENCY_HALF_LIFE_MS);
      recencyMultiplier = 1.0 + decay * 0.5; // up to 1.5x bonus for immediate recent use
    }

    // 3. Favorite multiplier
    const favoriteMultiplier = isFavorite ? 1.6 : 1.0;

    return frequencyMultiplier * recencyMultiplier * favoriteMultiplier;
  }

  /**
   * Records execution of an item and updates its metadata.
   */
  static recordUsage(item: CommandItem): CommandItem {
    return {
      ...item,
      usageCount: (item.usageCount || 0) + 1,
      lastUsed: Date.now()
    };
  }
}
