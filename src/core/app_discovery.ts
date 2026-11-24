/**
 * Application discovery engine for QuickKey.
 * Discovers installed desktop applications, start menu shortcuts, and built-in system tools.
 */

import { CommandItem } from '../types';

export interface DiscoveredApp {
  id: string;
  name: string;
  path: string;
  icon?: string;
  category: 'system' | 'installed' | 'utility';
  description?: string;
}

export class AppDiscoveryEngine {
  private static CACHE_KEY = 'quickkey_cached_apps_v1';
  private static appsCache: DiscoveredApp[] = [];

  static getBuiltInApps(): DiscoveredApp[] {
    return [
      { id: 'app_calc', name: 'Calculator', path: 'calc.exe', category: 'system', description: 'Windows Calculator' },
      { id: 'app_notepad', name: 'Notepad', path: 'notepad.exe', category: 'system', description: 'Text Editor' },
      { id: 'app_explorer', name: 'File Explorer', path: 'explorer.exe', category: 'system', description: 'Browse files and folders' },
      { id: 'app_taskmgr', name: 'Task Manager', path: 'taskmgr.exe', category: 'system', description: 'System performance and processes' },
      { id: 'app_cmd', name: 'Command Prompt', path: 'cmd.exe', category: 'system', description: 'Windows Command Interpreter' },
      { id: 'app_powershell', name: 'Windows PowerShell', path: 'powershell.exe', category: 'system', description: 'PowerShell Automation Engine' },
      { id: 'app_control', name: 'Control Panel', path: 'control.exe', category: 'system', description: 'Legacy System Configuration' },
      { id: 'app_settings', name: 'Settings', path: 'ms-settings:', category: 'system', description: 'Windows Modern Settings' },
      { id: 'app_regedit', name: 'Registry Editor', path: 'regedit.exe', category: 'system', description: 'Windows Registry Tools' },
      { id: 'app_paint', name: 'Paint', path: 'mspaint.exe', category: 'system', description: 'Image Editor' },
      { id: 'app_snipping', name: 'Snipping Tool', path: 'snippingtool.exe', category: 'system', description: 'Screen Capture Utility' },
      { id: 'app_vscode', name: 'Visual Studio Code', path: 'code.exe', category: 'installed', description: 'Code Editor' },
      { id: 'app_chrome', name: 'Google Chrome', path: 'chrome.exe', category: 'installed', description: 'Web Browser' },
      { id: 'app_edge', name: 'Microsoft Edge', path: 'msedge.exe', category: 'installed', description: 'Web Browser' }
    ];
  }

  static async discover(): Promise<DiscoveredApp[]> {
    if (this.appsCache.length > 0) {
      return this.appsCache;
    }

    const builtin = this.getBuiltInApps();

    // In Tauri context, query the native Rust backend for Start Menu and Registry installed apps
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const nativeApps = await invoke<DiscoveredApp[]>('discover_installed_apps');
        if (Array.isArray(nativeApps) && nativeApps.length > 0) {
          const combined = [...builtin, ...nativeApps];
          // Deduplicate by name
          const seen = new Set<string>();
          this.appsCache = combined.filter(a => {
            const lower = a.name.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
          });
          return this.appsCache;
        }
      } catch (err) {
        console.warn('Native app discovery fallback:', err);
      }
    }

    this.appsCache = builtin;
    return this.appsCache;
  }

  static toCommandItems(apps: DiscoveredApp[]): CommandItem[] {
    return apps.map(app => ({
      id: app.id,
      title: app.name,
      subtitle: app.description || app.path,
      category: 'application',
      icon: 'AppWindow',
      keywords: [app.name, app.category, 'app', 'application', app.path],
      action: async () => {
        if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('launch_application', { appPath: app.path });
            return;
          } catch (e) {
            console.warn('Failed to launch application via native bridge:', e);
          }
        }
        console.info(`[QuickKey Launcher] Executing application target: ${app.path}`);
      }
    }));
  }
}
