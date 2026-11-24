/**
 * Search history and query telemetry manager with LRU eviction and zero external transmission.
 */

export interface HistoryEntry {
  query: string;
  timestamp: number;
  selectedItemId?: string;
  category?: string;
}

export class HistoryManager {
  private static MAX_ENTRIES = 50;
  private static STORAGE_KEY = 'quickkey_query_history_v1';

  static getHistory(): HistoryEntry[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static addEntry(query: string, selectedItemId?: string, category?: string): void {
    const trimmed = query.trim();
    if (!trimmed) return;

    let history = this.getHistory();
    // Remove duplicate recent queries
    history = history.filter(h => h.query.toLowerCase() !== trimmed.toLowerCase());

    history.unshift({
      query: trimmed,
      timestamp: Date.now(),
      selectedItemId,
      category
    });

    if (history.length > this.MAX_ENTRIES) {
      history = history.slice(0, this.MAX_ENTRIES);
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    }
  }

  static clearHistory(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
