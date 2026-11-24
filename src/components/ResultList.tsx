import React from 'react';
import { CommandItem } from '../types';

interface ResultListProps {
  items: Array<{ item: CommandItem; matches: [number, number][] }>;
  selectedIndex: number;
  onSelect: (item: CommandItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const ResultList: React.FC<ResultListProps> = ({
  items,
  selectedIndex,
  onSelect,
  onToggleFavorite
}) => {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        No matching commands, applications, or files found.
      </div>
    );
  }

  const renderHighlighted = (text: string, matches: [number, number][]) => {
    if (!matches || matches.length === 0) return text;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    matches.forEach(([start, end], i) => {
      if (start > lastIdx) {
        elements.push(text.slice(lastIdx, start));
      }
      elements.push(
        <span key={i} className="text-indigo-400 font-bold bg-indigo-500/10 rounded px-0.5">
          {text.slice(start, end)}
        </span>
      );
      lastIdx = end;
    });

    if (lastIdx < text.length) {
      elements.push(text.slice(lastIdx));
    }

    return elements;
  };

  return (
    <div className="max-h-96 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
      {items.map(({ item, matches }, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {item.category.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="font-medium text-sm truncate">
                  {renderHighlighted(item.title, matches)}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={(e) => onToggleFavorite(item.id, e)}
                className={`p-1 rounded hover:text-amber-400 transition-colors ${
                  item.isFavorite ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'
                }`}
                title={item.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
              >
                ★
              </button>

              {item.shortcut && (
                <kbd className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-700 text-gray-400 rounded font-mono">
                  {item.shortcut}
                </kbd>
              )}

              {isSelected && (
                <span className="text-xs text-indigo-400 hidden sm:inline-block font-mono">
                  ↵
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
