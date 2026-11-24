/**
 * Dynamic theme and design system controller for QuickKey.
 * Handles system theme synchronization, dark/light presets, and CSS variable injection.
 */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface ThemeColors {
  background: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  highlightBg: string;
}

export const THEME_PRESETS: Record<'dark' | 'light', ThemeColors> = {
  dark: {
    background: '#090d16',
    cardBg: '#0f172a',
    border: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    highlightBg: 'rgba(99, 102, 241, 0.15)'
  },
  light: {
    background: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    accent: '#4f46e5',
    accentHover: '#4338ca',
    highlightBg: 'rgba(79, 70, 229, 0.1)'
  }
};

export class ThemeManager {
  static getEffectiveTheme(mode: ThemeMode): 'dark' | 'light' {
    if (mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    return mode;
  }

  static applyTheme(mode: ThemeMode): 'dark' | 'light' {
    const effective = this.getEffectiveTheme(mode);
    const colors = THEME_PRESETS[effective];

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add(effective);

      root.style.setProperty('--qk-bg', colors.background);
      root.style.setProperty('--qk-card-bg', colors.cardBg);
      root.style.setProperty('--qk-border', colors.border);
      root.style.setProperty('--qk-text-primary', colors.textPrimary);
      root.style.setProperty('--qk-text-secondary', colors.textSecondary);
      root.style.setProperty('--qk-accent', colors.accent);
      root.style.setProperty('--qk-accent-hover', colors.accentHover);
      root.style.setProperty('--qk-highlight-bg', colors.highlightBg);
    }

    return effective;
  }
}
