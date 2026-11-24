/**
 * Custom workflow and command manager for QuickKey.
 * Allows users to register custom terminal commands, URL triggers, and script shortcuts.
 */

import { CommandItem, CustomCommand } from '../types';

export class CustomCommandService {
  private commands: Map<string, CustomCommand> = new Map();

  constructor(initialCommands?: CustomCommand[]) {
    if (initialCommands) {
      initialCommands.forEach(cmd => this.commands.set(cmd.id, cmd));
    } else {
      this.loadDefaults();
    }
  }

  private loadDefaults() {
    const defaults: CustomCommand[] = [
      {
        id: 'cmd_github',
        name: 'GitHub',
        trigger: 'gh',
        category: 'url',
        payload: 'https://github.com',
        icon: 'Globe',
        shortcut: 'Alt+G',
        createdAt: Date.now()
      },
      {
        id: 'cmd_google',
        name: 'Google Search',
        trigger: 'google',
        category: 'url',
        payload: 'https://www.google.com',
        icon: 'Search',
        createdAt: Date.now()
      },
      {
        id: 'cmd_ipconfig',
        name: 'Flush DNS & Check IP',
        trigger: 'ip',
        category: 'terminal',
        payload: 'ipconfig /flushdns',
        icon: 'Terminal',
        createdAt: Date.now()
      }
    ];

    defaults.forEach(c => this.commands.set(c.id, c));
  }

  getAll(): CustomCommand[] {
    return Array.from(this.commands.values());
  }

  add(command: Omit<CustomCommand, 'id' | 'createdAt'>): CustomCommand {
    const newCmd: CustomCommand = {
      ...command,
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now()
    };
    this.commands.set(newCmd.id, newCmd);
    return newCmd;
  }

  update(id: string, updates: Partial<Omit<CustomCommand, 'id' | 'createdAt'>>): boolean {
    const existing = this.commands.get(id);
    if (!existing) return false;
    this.commands.set(id, { ...existing, ...updates });
    return true;
  }

  delete(id: string): boolean {
    return this.commands.delete(id);
  }

  toCommandItems(): CommandItem[] {
    return this.getAll().map(cmd => ({
      id: cmd.id,
      title: cmd.name,
      subtitle: `${cmd.category.toUpperCase()}: ${cmd.payload}`,
      category: 'custom',
      icon: cmd.icon || (cmd.category === 'url' ? 'Globe' : 'Terminal'),
      shortcut: cmd.shortcut,
      keywords: [cmd.trigger, cmd.name, cmd.category, 'custom'],
      action: async () => this.executeCommand(cmd)
    }));
  }

  async executeCommand(cmd: CustomCommand): Promise<void> {
    if (cmd.category === 'url') {
      if (typeof window !== 'undefined') {
        window.open(cmd.payload, '_blank');
      }
      return;
    }

    if (cmd.category === 'terminal' || cmd.category === 'script') {
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          await invoke('execute_terminal_command', { command: cmd.payload });
          return;
        } catch (e) {
          console.warn('Tauri execute_terminal_command error:', e);
        }
      }
      console.info(`[QuickKey Custom Command Executed]: ${cmd.payload}`);
    }
  }
}
