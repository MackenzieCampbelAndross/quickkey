/**
 * Storage service for QuickKey.
 * Handles persistent local settings, favorites, usage metrics, and custom commands.
 */

import { AppSettings, CustomCommand } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  globalShortcut: 'CommandOrControl+Space',
  maxResults: 9,
  indexedPaths: [
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Users\\Default\\Desktop'
  ],
  fileExtensions: ['.exe', '.lnk', '.pdf', '.docx', '.xlsx', '.txt', '.png', '.jpg'],
  enableFuzzySearch: true,
  enableCalculator: true,
  enableSystemCommands: true,
  autoStartOnBoot: false
};

const STORAGE_KEYS = {
  SETTINGS: 'quickkey_settings_v1',
  FAVORITES: 'quickkey_favorites_v1',
  USAGE_METRICS: 'quickkey_usage_metrics_v1',
  CUSTOM_COMMANDS: 'quickkey_custom_commands_v1'
};

export class StorageService {
  static getSettings(): AppSettings {
    if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...jsonParse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
    return updated;
  }

  static getFavorites(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return raw ? jsonParse(raw) : [];
    } catch {
      return [];
    }
  }

  static toggleFavorite(itemId: string): boolean {
    const favorites = new Set(this.getFavorites());
    let isFav = false;
    if (favorites.has(itemId)) {
      favorites.delete(itemId);
    } else {
      favorites.add(itemId);
      isFav = true;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(Array.from(favorites)));
    }
    return isFav;
  }

  static getUsageMetrics(): Record<string, { count: number; lastUsed: number }> {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USAGE_METRICS);
      return raw ? jsonParse(raw) : {};
    } catch {
      return {};
    }
  }

  static recordUsage(itemId: string): void {
    const metrics = this.getUsageMetrics();
    const current = metrics[itemId] || { count: 0, lastUsed: 0 };
    metrics[itemId] = {
      count: current.count + 1,
      lastUsed: Date.now()
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USAGE_METRICS, JSON.stringify(metrics));
    }
  }

  static getCustomCommands(): CustomCommand[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_COMMANDS);
      return raw ? jsonParse(raw) : [];
    } catch {
      return [];
    }
  }

  static saveCustomCommands(commands: CustomCommand[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_COMMANDS, JSON.stringify(commands));
    }
  }
}

function jsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
