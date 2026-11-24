/**
 * High-performance fuzzy search engine with word boundary bonuses and match highlighting.
 */

export interface FuzzyMatchResult {
  score: number;
  matches: [number, number][]; // Array of [start, end] indices for highlighting
}

export function fuzzyMatch(pattern: string, target: string): FuzzyMatchResult | null {
  if (!pattern) return { score: 1.0, matches: [] };
  if (!target) return null;

  const pLower = pattern.toLowerCase();
  const tLower = target.toLowerCase();

  // 1. Exact match bonus
  if (tLower === pLower) {
    return { score: 1000, matches: [[0, target.length]] };
  }

  // 2. Starts with / prefix bonus
  if (tLower.startsWith(pLower)) {
    return { score: 500 + (100 / target.length), matches: [[0, pattern.length]] };
  }

  // 3. Substring match
  const substrIdx = tLower.indexOf(pLower);
  if (substrIdx !== -1) {
    // Word boundary check
    const isWordBoundary = substrIdx === 0 || /[\s_\-./\\]/.test(target[substrIdx - 1]);
    const score = (isWordBoundary ? 300 : 200) - substrIdx + (100 / target.length);
    return { score, matches: [[substrIdx, substrIdx + pattern.length]] };
  }

  // 4. Sequential fuzzy character matching
  let pIdx = 0;
  let score = 0;
  const matchIndices: number[] = [];
  let consecutiveCount = 0;

  for (let tIdx = 0; tIdx < target.length && pIdx < pattern.length; tIdx++) {
    if (tLower[tIdx] === pLower[pIdx]) {
      matchIndices.push(tIdx);

      // Boundary bonus
      const isBoundary = tIdx === 0 || /[\s_\-./\\]/.test(target[tIdx - 1]);
      if (isBoundary) score += 30;

      // Uppercase / camelCase bonus
      if (target[tIdx] !== target[tIdx].toLowerCase()) score += 15;

      // Consecutive match bonus
      if (consecutiveCount > 0) score += consecutiveCount * 10;
      consecutiveCount++;

      pIdx++;
    } else {
      consecutiveCount = 0;
    }
  }

  // If entire pattern matched
  if (pIdx === pattern.length) {
    // Penalty for long targets
    score -= (target.length - pattern.length);
    
    // Group consecutive matches into ranges
    const ranges: [number, number][] = [];
    if (matchIndices.length > 0) {
      let start = matchIndices[0];
      let end = matchIndices[0] + 1;
      for (let i = 1; i < matchIndices.length; i++) {
        if (matchIndices[i] === end) {
          end++;
        } else {
          ranges.push([start, end]);
          start = matchIndices[i];
          end = matchIndices[i] + 1;
        }
      }
      ranges.push([start, end]);
    }

    return { score: Math.max(score, 1), matches: ranges };
  }

  return null;
}

export function searchFilter<T>(
  items: T[],
  query: string,
  keyExtractor: (item: T) => string[],
  scoreMultiplier?: (item: T) => number
): Array<{ item: T; score: number; matches: [number, number][] }> {
  if (!query.trim()) {
    return items.map(item => ({ item, score: 0, matches: [] }));
  }

  const results: Array<{ item: T; score: number; matches: [number, number][] }> = [];

  for (const item of items) {
    const keys = keyExtractor(item);
    let bestScore = -1;
    let bestMatches: [number, number][] = [];

    for (let k = 0; k < keys.length; k++) {
      const match = fuzzyMatch(query, keys[k]);
      if (match) {
        // primary key (title) gets 1.5x weight over secondary keywords
        const weight = k === 0 ? 1.5 : 1.0;
        const total = match.score * weight;
        if (total > bestScore) {
          bestScore = total;
          bestMatches = match.matches;
        }
      }
    }

    if (bestScore > 0) {
      const multiplier = scoreMultiplier ? scoreMultiplier(item) : 1.0;
      results.push({ item, score: bestScore * multiplier, matches: bestMatches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
