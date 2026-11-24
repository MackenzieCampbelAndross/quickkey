import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CommandItem, CommandCategory, AppSettings, CustomCommand, CalculationResult } from '../types';
import { SearchInput } from './SearchInput';
import { ResultList } from './ResultList';
import { CalculatorPreview } from './CalculatorPreview';
import { FavoritesSection } from './FavoritesSection';
import { SettingsModal } from './SettingsModal';
import { CustomCommandEditor } from './CustomCommandEditor';
import { searchFilter } from '../core/fuzzy_search';
import { Calculator } from '../core/calculator';
import { RankingEngine } from '../core/ranking';
import { StorageService } from '../core/storage';
import { ShortcutsManager } from '../core/shortcuts';

interface CommandPaletteProps {
  initialItems: CommandItem[];
  customCommandService: {
    getAll: () => CustomCommand[];
    add: (c: any) => CustomCommand;
    update: (id: string, updates: any) => boolean;
    delete: (id: string) => boolean;
    toCommandItems: () => CommandItem[];
  };
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  initialItems,
  customCommandService
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CommandCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [favoritesSet, setFavoritesSet] = useState<Set<string>>(() => new Set(StorageService.getFavorites()));
  const [recentItems, setRecentItems] = useState<CommandItem[]>([]);
  const [customCommands, setCustomCommands] = useState<CustomCommand[]>(() => customCommandService.getAll());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCustomCmdOpen, setIsCustomCmdOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Combine items
  const allItems = useMemo(() => {
    const customItems = customCommandService.toCommandItems();
    const combined = [...initialItems, ...customItems];
    return combined.map((item) => ({
      ...item,
      isFavorite: favoritesSet.has(item.id)
    }));
  }, [initialItems, customCommands, favoritesSet]);

  // Live calculation detection
  const calculationResult: CalculationResult | null = useMemo(() => {
    if (!settings.enableCalculator || !query.trim()) return null;
    return Calculator.evaluate(query);
  }, [query, settings.enableCalculator]);

  // Search filtering & ranking
  const filteredResults = useMemo(() => {
    let itemsToFilter = allItems;
    if (category !== 'all') {
      itemsToFilter = itemsToFilter.filter((item) => item.category === category);
    }

    if (!settings.enableFuzzySearch) {
      const q = query.toLowerCase().trim();
      return itemsToFilter
        .filter((i) => i.title.toLowerCase().includes(q) || (i.keywords && i.keywords.some((k) => k.toLowerCase().includes(q))))
        .slice(0, settings.maxResults)
        .map((item) => ({ item, score: 1, matches: [] as [number, number][] }));
    }

    return searchFilter(
      itemsToFilter,
      query,
      (item) => [item.title, ...(item.keywords || []), item.subtitle || ''],
      (item) => RankingEngine.computeMultiplier(item)
    ).slice(0, settings.maxResults);
  }, [allItems, query, category, settings.enableFuzzySearch, settings.maxResults]);

  // Reset selected index when query or results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, category]);

  // Global key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (ShortsMatch(e, ['ArrowDown', 'KeyJ'])) {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev + 1) % filteredResults.length : 0));
    } else if (ShortsMatch(e, ['ArrowUp', 'KeyK'])) {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length > 0 ? (prev - 1 + filteredResults.length) % filteredResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (calculationResult && selectedIndex === 0 && !filteredResults.length) {
        handleCopyCalculation();
      } else if (filteredResults[selectedIndex]) {
        handleExecute(filteredResults[selectedIndex].item);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (query) {
        setQuery('');
      }
    }
  };

  const handleExecute = async (item: CommandItem) => {
    // Record usage
    StorageService.recordUsage(item.id);
    setRecentItems((prev) => [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 8));

    try {
      await item.action();
    } catch (err) {
      console.error(`Error executing action for ${item.title}:`, err);
    }
  };

  const handleCopyCalculation = () => {
    if (calculationResult && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(calculationResult.formatted);
      setQuery('');
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isFav = StorageService.toggleFavorite(id);
    setFavoritesSet((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    const updated = StorageService.saveSettings(newSettings);
    setSettings(updated);
  };

  const handleSaveCustomCmd = (cmd: any, id?: string) => {
    if (id) {
      customCommandService.update(id, cmd);
    } else {
      customCommandService.add(cmd);
    }
    const fresh = customCommandService.getAll();
    StorageService.saveCustomCommands(fresh);
    setCustomCommands([...fresh]);
  };

  const handleDeleteCustomCmd = (id: string) => {
    customCommandService.delete(id);
    const fresh = customCommandService.getAll();
    StorageService.saveCustomCommands(fresh);
    setCustomCommands([...fresh]);
  };

  const favoritesList = useMemo(
    () => allItems.filter((i) => favoritesSet.has(i.id)),
    [allItems, favoritesSet]
  );

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl bg-gray-900/90 border border-gray-800 backdrop-blur-2xl overflow-hidden flex flex-col font-sans transition-all">
      {/* Search Input Bar */}
      <SearchInput
        value={query}
        onChange={setQuery}
        selectedCategory={category}
        onSelectCategory={setCategory}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
      />

      {/* Pinned Favorites & Recents */}
      {!query && (
        <FavoritesSection
          favorites={favoritesList}
          recent={recentItems}
          onSelect={handleExecute}
        />
      )}

      {/* Live Calculator Preview Card */}
      {calculationResult && (
        <CalculatorPreview
          calculation={calculationResult}
          onSelect={handleCopyCalculation}
        />
      )}

      {/* Results List */}
      <ResultList
        items={filteredResults}
        selectedIndex={selectedIndex}
        onSelect={handleExecute}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Status & Shortcuts Bar */}
      <div className="px-4 py-2 border-t border-gray-800/80 bg-gray-950/80 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>
            <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">↑</kbd>
            <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded ml-1">↓</kbd> Navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">↵</kbd> Select
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-gray-800 text-gray-400 rounded">Esc</kbd> Clear
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomCmdOpen(true)}
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            + Workflows
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-indigo-400 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <CustomCommandEditor
        isOpen={isCustomCmdOpen}
        onClose={() => setIsCustomCmdOpen(false)}
        commands={customCommands}
        onSave={handleSaveCustomCmd}
        onDelete={handleDeleteCustomCmd}
      />
    </div>
  );
};

function ShortsMatch(e: React.KeyboardEvent, keys: string[]): boolean {
  return keys.some((k) => e.key === k || e.code === k);
}
