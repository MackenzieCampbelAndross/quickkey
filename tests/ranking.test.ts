import { describe, it, expect } from 'vitest';
import { RankingEngine } from '../src/core/ranking';
import { CommandItem } from '../src/types';

describe('RankingEngine', () => {
  const baseItem: CommandItem = {
    id: 'test_item',
    title: 'Test Command',
    category: 'application',
    action: () => {}
  };

  it('boosts multiplier based on execution frequency', () => {
    const unvisited = { ...baseItem, usageCount: 0 };
    const frequent = { ...baseItem, usageCount: 15 };

    const unvisitedScore = RankingEngine.computeMultiplier(unvisited);
    const frequentScore = RankingEngine.computeMultiplier(frequent);

    expect(frequentScore).toBeGreaterThan(unvisitedScore);
  });

  it('boosts multiplier for favorite items', () => {
    const normal = { ...baseItem, isFavorite: false };
    const favorite = { ...baseItem, isFavorite: true };

    const normalScore = RankingEngine.computeMultiplier(normal);
    const favoriteScore = RankingEngine.computeMultiplier(favorite);

    expect(favoriteScore).toBeGreaterThan(normalScore);
  });

  it('boosts multiplier for recently used items', () => {
    const now = Date.now();
    const recent = { ...baseItem, lastUsed: now - 1000 }; // 1 sec ago
    const old = { ...baseItem, lastUsed: now - 30 * 24 * 60 * 60 * 1000 }; // 30 days ago

    const recentScore = RankingEngine.computeMultiplier(recent);
    const oldScore = RankingEngine.computeMultiplier(old);

    expect(recentScore).toBeGreaterThan(oldScore);
  });

  it('records usage and updates timestamps', () => {
    const updated = RankingEngine.recordUsage(baseItem);
    expect(updated.usageCount).toBe(1);
    expect(updated.lastUsed).toBeGreaterThan(0);
  });
});
