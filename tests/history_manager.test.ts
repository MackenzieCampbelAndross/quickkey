import { describe, it, expect } from 'vitest';
import { HistoryManager } from '../src/core/history_manager';

describe('HistoryManager', () => {
  it('manages query history and prevents duplicate immediate consecutive queries', () => {
    HistoryManager.clearHistory();
    HistoryManager.addEntry('calculator');
    HistoryManager.addEntry('notepad');
    HistoryManager.addEntry('notepad'); // Duplicate

    const history = HistoryManager.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].query).toBe('notepad');
    expect(history[1].query).toBe('calculator');
  });

  it('clears query history when requested', () => {
    HistoryManager.addEntry('test');
    HistoryManager.clearHistory();
    expect(HistoryManager.getHistory().length).toBe(0);
  });
});
