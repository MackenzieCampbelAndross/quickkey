import { describe, it, expect } from 'vitest';
import { StorageService, DEFAULT_SETTINGS } from '../src/core/storage';

describe('StorageService', () => {
  it('returns default settings when storage is empty', () => {
    const settings = StorageService.getSettings();
    expect(settings).toBeDefined();
    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(settings.maxResults).toBe(DEFAULT_SETTINGS.maxResults);
  });

  it('updates partial settings correctly', () => {
    const updated = StorageService.saveSettings({ maxResults: 15 });
    expect(updated.maxResults).toBe(15);
    expect(updated.theme).toBe(DEFAULT_SETTINGS.theme);
  });

  it('toggles favorites appropriately', () => {
    const isFavNow = StorageService.toggleFavorite('item_1');
    expect(typeof isFavNow).toBe('boolean');
  });
});
