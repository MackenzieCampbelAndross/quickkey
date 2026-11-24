import { describe, it, expect } from 'vitest';
import { ThemeManager, THEME_PRESETS } from '../src/core/theme_manager';

describe('ThemeManager', () => {
  it('resolves dark and light theme presets correctly', () => {
    expect(ThemeManager.getEffectiveTheme('dark')).toBe('dark');
    expect(ThemeManager.getEffectiveTheme('light')).toBe('light');
  });

  it('provides complete color palette definitions for all themes', () => {
    for (const key of ['dark', 'light'] as const) {
      const colors = THEME_PRESETS[key];
      expect(colors.background).toBeDefined();
      expect(colors.textPrimary).toBeDefined();
      expect(colors.accent).toBeDefined();
    }
  });
});
