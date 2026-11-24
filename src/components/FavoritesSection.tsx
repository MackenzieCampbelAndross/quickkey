import React from 'react';
import { CommandItem } from '../types';

interface FavoritesSectionProps {
  favorites: CommandItem[];
  recent: CommandItem[];
  onSelect: (item: CommandItem) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favorites,
  recent,
  onSelect
}) => {
  if (favorites.length === 0 && recent.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-800/60 bg-gray-950/40 text-xs">
      {favorites.length > 0 && (
        <div className="flex items-center gap-2 mb-1.5 overflow-x-auto scrollbar-none">
          <span className="text-gray-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">
            Favorites:
          </span>
          {favorites.map((fav) => (
            <button
              key={fav.id}
              onClick={() => onSelect(fav)}
              className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1 shrink-0"
            >
              <span>★</span>
              <span>{fav.title}</span>
            </button>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-gray-500 font-semibold uppercase tracking-wider shrink-0 text-[10px]">
            Recent:
          </span>
          {recent.slice(0, 5).map((rec) => (
            <button
              key={rec.id}
              onClick={() => onSelect(rec)}
              className="px-2 py-0.5 rounded bg-gray-800/60 border border-gray-700/40 text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all shrink-0"
            >
              {rec.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
