/**
 * File and folder indexing engine for QuickKey.
 * Scans user configured directories with extension filters and exclusion patterns.
 */

import { CommandItem } from '../types';

export interface IndexedFile {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  extension: string;
  sizeBytes?: number;
  lastModified?: number;
}

export class FileIndexer {
  private indexedItems: IndexedFile[] = [];

  constructor(initialItems?: IndexedFile[]) {
    if (initialItems) {
      this.indexedItems = initialItems;
    } else {
      this.loadSeedData();
    }
  }

  private loadSeedData() {
    this.indexedItems = [
      { id: 'f_docs', name: 'Documents', path: 'C:\\Users\\Default\\Documents', isDirectory: true, extension: '' },
      { id: 'f_downloads', name: 'Downloads', path: 'C:\\Users\\Default\\Downloads', isDirectory: true, extension: '' },
      { id: 'f_desktop', name: 'Desktop', path: 'C:\\Users\\Default\\Desktop', isDirectory: true, extension: '' },
      { id: 'f_projects', name: 'Projects', path: 'D:\\Mac\\project', isDirectory: true, extension: '' },
      { id: 'f_creston', name: 'creston', path: 'D:\\Mac\\project\\creston', isDirectory: true, extension: '' },
      { id: 'f_15pipeline', name: '15_PROJECT_PIPELINE', path: 'D:\\Mac\\project\\15_PROJECT_PIPELINE', isDirectory: true, extension: '' }
    ];
  }

  getAll(): IndexedFile[] {
    return this.indexedItems;
  }

  add(file: IndexedFile) {
    this.indexedItems.push(file);
  }

  async scanPath(path: string, extensions: string[] = []): Promise<IndexedFile[]> {
    if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        const results = await invoke<IndexedFile[]>('scan_directory', { dirPath: path, extensions });
        if (Array.isArray(results)) {
          this.indexedItems.push(...results);
          return results;
        }
      } catch (err) {
        console.warn('Native scan error:', err);
      }
    }
    return this.indexedItems.filter(f => f.path.startsWith(path));
  }

  toCommandItems(): CommandItem[] {
    return this.indexedItems.map(item => ({
      id: item.id,
      title: item.name,
      subtitle: item.path,
      category: item.isDirectory ? 'folder' : 'file',
      icon: item.isDirectory ? 'Folder' : 'FileText',
      keywords: [item.name, item.extension, item.isDirectory ? 'folder' : 'file', item.path],
      action: async () => {
        if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
          try {
            const { invoke } = await import('@tauri-apps/api/core');
            await invoke('open_file_or_folder', { targetPath: item.path });
            return;
          } catch (e) {
            console.warn('Failed to open path natively:', e);
          }
        }
        console.info(`[QuickKey File Explorer] Opening item: ${item.path}`);
      }
    }));
  }
}
