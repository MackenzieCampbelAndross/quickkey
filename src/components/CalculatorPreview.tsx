import React from 'react';
import { CalculationResult } from '../types';

interface CalculatorPreviewProps {
  calculation: CalculationResult;
  onSelect: () => void;
}

export const CalculatorPreview: React.FC<CalculatorPreviewProps> = ({ calculation, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="mx-4 my-2 p-3.5 rounded-lg border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-950/40 cursor-pointer transition-all flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
          =
        </div>
        <div>
          <div className="text-xs text-indigo-300/80 font-mono">{calculation.expression}</div>
          <div className="text-lg font-bold text-white font-mono">{calculation.formatted}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
          Press Enter to Copy
        </span>
      </div>
    </div>
  );
};
