export type CommandCategory = 
  | 'application'
  | 'file'
  | 'folder'
  | 'system'
  | 'calculator'
  | 'web'
  | 'custom'
  | 'action';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: string;
  action: () => Promise<void> | void;
  keywords?: string[];
  score?: number;
  usageCount?: number;
  lastUsed?: number;
  isFavorite?: boolean;
}

export interface CustomCommand {
  id: string;
  name: string;
  trigger: string;
  category: 'terminal' | 'url' | 'script';
  payload: string;
  shortcut?: string;
  icon?: string;
  createdAt: number;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  globalShortcut: string;
  maxResults: number;
  indexedPaths: string[];
  fileExtensions: string[];
  enableFuzzySearch: boolean;
  enableCalculator: boolean;
  enableSystemCommands: boolean;
  autoStartOnBoot: boolean;
}

export interface CalculationResult {
  expression: string;
  result: string | number;
  type: 'math' | 'unit' | 'binary' | 'hex';
  formatted: string;
}
