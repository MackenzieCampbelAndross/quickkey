/**
 * Keyboard shortcuts controller for QuickKey.
 * Manages global window toggle keybinding and palette navigation events.
 */

export interface KeybindingMap {
  moveUp: string[];
  moveDown: string[];
  select: string[];
  close: string[];
  toggleSettings: string[];
  toggleFavorite: string[];
}

export const DEFAULT_KEYBINDINGS: KeybindingMap = {
  moveUp: ['ArrowUp', 'KeyK'], // ArrowUp or Ctrl+K
  moveDown: ['ArrowDown', 'KeyJ'], // ArrowDown or Ctrl+J
  select: ['Enter'],
  close: ['Escape'],
  toggleSettings: ['Comma'], // Ctrl+,
  toggleFavorite: ['KeyD'] // Ctrl+D
};

export class ShortcutsManager {
  static isMatch(e: KeyboardEvent, actions: string[]): boolean {
    for (const action of actions) {
      if (action.startsWith('Key') && e.ctrlKey && e.code === action) return true;
      if (e.key === action || e.code === action) return true;
    }
    return false;
  }

  static async registerGlobalShortcut(shortcut: string, onTrigger: () => void): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const { register, unregisterAll } = await import('@tauri-apps/plugin-global-shortcut');
        await unregisterAll();
        await register(shortcut, () => onTrigger());
        return true;
      } catch (err) {
        console.warn('Failed to register global shortcut natively:', err);
      }
    }
    return false;
  }
}
