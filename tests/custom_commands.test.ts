import { describe, it, expect } from 'vitest';
import { CustomCommandService } from '../src/core/custom_commands';

describe('CustomCommandService', () => {
  it('loads and returns default commands', () => {
    const service = new CustomCommandService();
    const all = service.getAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('allows adding, updating, and deleting custom commands', () => {
    const service = new CustomCommandService();
    
    // Add
    const added = service.add({
      name: 'Custom Script',
      trigger: 'run-script',
      category: 'terminal',
      payload: 'echo "hello"'
    });
    expect(added.id).toBeDefined();
    expect(service.getAll().some(c => c.id === added.id)).toBe(true);

    // Update
    const updated = service.update(added.id, { name: 'Updated Script' });
    expect(updated).toBe(true);
    expect(service.getAll().find(c => c.id === added.id)?.name).toBe('Updated Script');

    // Delete
    const deleted = service.delete(added.id);
    expect(deleted).toBe(true);
    expect(service.getAll().some(c => c.id === added.id)).toBe(false);
  });

  it('converts custom commands to executable CommandItems', () => {
    const service = new CustomCommandService();
    const items = service.toCommandItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].category).toBe('custom');
    expect(typeof items[0].action).toBe('function');
  });
});
