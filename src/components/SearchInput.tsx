import React from 'react';
import { CommandCategory } from '../types';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  selectedCategory: CommandCategory | 'all';
  onSelectCategory: (cat: CommandCategory | 'all') => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const CATEGORIES: { id: CommandCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'application', label: 'Apps' },
  { id: 'file', label: 'Files' },
  { id: 'system', label: 'System' },
  { id: 'custom', label: 'Custom' }
];

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  selectedCategory,
  onSelectCategory,
  onKeyDown,
  inputRef
}) => {
  return (
    <div className="w-full border-b border-gray-800 p-4 bg-gray-900/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-indigo-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search apps, files, commands, or calculate (e.g. sqrt(144) + 2^4)..."
          className="w-full bg-transparent text-lg text-gray-100 placeholder-gray-500 outline-none border-none font-medium"
          autoFocus
          spellCheck={false}
        />

        {value && (
          <button
            onClick={() => onChange('')}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Clear"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800/40 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-800/70 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
