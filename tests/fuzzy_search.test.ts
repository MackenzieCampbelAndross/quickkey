import { describe, it, expect } from 'vitest';
import { fuzzyMatch, searchFilter } from '../src/core/fuzzy_search';

describe('FuzzySearch Engine', () => {
  it('returns perfect score for exact matches', () => {
    const res = fuzzyMatch('chrome', 'Chrome');
    expect(res).not.toBeNull();
    expect(res!.score).toBeGreaterThanOrEqual(1000);
    expect(res!.matches).toEqual([[0, 6]]);
  });

  it('awards strong prefix bonus', () => {
    const prefixRes = fuzzyMatch('notep', 'Notepad');
    const midRes = fuzzyMatch('tep', 'Notepad');
    expect(prefixRes).not.toBeNull();
    expect(midRes).not.toBeNull();
    expect(prefixRes!.score).toBeGreaterThan(midRes!.score);
  });

  it('correctly matches acronyms and word boundaries', () => {
    const res = fuzzyMatch('vsc', 'Visual Studio Code');
    expect(res).not.toBeNull();
    expect(res!.matches.length).toBeGreaterThan(0);
  });

  it('rejects non-matching patterns', () => {
    const res = fuzzyMatch('xyz123', 'Calculator');
    expect(res).toBeNull();
  });

  it('filters and ranks candidate items in descending score order', () => {
    const items = [
      { id: '1', title: 'File Explorer', keywords: ['files', 'folder'] },
      { id: '2', title: 'Firefox', keywords: ['browser', 'web'] },
      { id: '3', title: 'FileZilla', keywords: ['ftp', 'files'] }
    ];

    const results = searchFilter(items, 'file', (item) => [item.title, ...item.keywords]);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].item.title.startsWith('File')).toBe(true);
    expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
  });
});
