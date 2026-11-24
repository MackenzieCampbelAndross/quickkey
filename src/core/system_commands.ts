/**
 * System commands controller for QuickKey.
 * Integrates with Windows native capabilities (via Tauri or fallback commands).
 */

import { CommandItem } from '../types';

export interface SystemCommandDef {
  id: string;
  title: string;
  subtitle: string;
  keywords: string[];
  icon: string;
  execute: () => Promise<void>;
}

export class SystemCommandsManager {
  static getCommands(): CommandItem[] {
    const definitions: SystemCommandDef[] = [
      {
        id: 'sys_lock',
        title: 'Lock Workstation',
        subtitle: 'Lock the current Windows session',
        keywords: ['lock', 'screen', 'security', 'session'],
        icon: 'Lock',
        execute: async () => this.executeAction('lock')
      },
      {
        id: 'sys_sleep',
        title: 'Sleep / Suspend',
        subtitle: 'Put computer into low-power sleep state',
        keywords: ['sleep', 'standby', 'power', 'suspend'],
        icon: 'Moon',
        execute: async () => this.executeAction('sleep')
      },
      {
        id: 'sys_restart',
        title: 'Restart Computer',
        subtitle: 'Reboot the operating system',
        keywords: ['restart', 'reboot', 'power', 'reset'],
        icon: 'RotateCw',
        execute: async () => this.executeAction('restart')
      },
      {
        id: 'sys_shutdown',
        title: 'Shut Down',
        subtitle: 'Power off the computer',
        keywords: ['shutdown', 'power off', 'turn off'],
        icon: 'Power',
        execute: async () => this.executeAction('shutdown')
      },
      {
        id: 'sys_taskmgr',
        title: 'Open Task Manager',
        subtitle: 'Inspect running processes and performance',
        keywords: ['taskmgr', 'processes', 'cpu', 'memory', 'kill'],
        icon: 'Activity',
        execute: async () => this.executeAction('taskmgr')
      },
      {
        id: 'sys_recycle',
        title: 'Empty Recycle Bin',
        subtitle: 'Permanently remove deleted files',
        keywords: ['recycle', 'bin', 'trash', 'clean', 'delete'],
        icon: 'Trash2',
        execute: async () => this.executeAction('empty_recycle_bin')
      },
      {
        id: 'sys_terminal',
        title: 'Open Terminal',
        subtitle: 'Launch PowerShell / Command Prompt',
        keywords: ['cmd', 'terminal', 'powershell', 'cli', 'bash'],
        icon: 'Terminal',
        execute: async () => this.executeAction('open_terminal')
      },
      {
        id: 'sys_settings',
        title: 'Windows Settings',
        subtitle: 'Open Windows System Settings',
        keywords: ['settings', 'config', 'control panel', 'options'],
        icon: 'Settings',
        execute: async () => this.executeAction('open_settings')
      }
    ];

    return definitions.map(def => ({
      id: def.id,
      title: def.title,
      subtitle: def.subtitle,
      category: 'system',
      icon: def.icon,
      keywords: def.keywords,
      action: def.execute
    }));
  }

  private static async executeAction(actionName: string): Promise<void> {
    // Check if running within Tauri desktop context
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('execute_system_command', { action: actionName });
        return;
      } catch (err) {
        console.warn(`Tauri invocation error for '${actionName}':`, err);
      }
    }

    // Web / local preview mock execution
    console.info(`[QuickKey Desktop Engine] Triggered system command: ${actionName}`);
  }
}
