import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [newPath, setNewPath] = useState('');

  if (!isOpen) return null;

  const handleAddPath = () => {
    if (newPath.trim() && !form.indexedPaths.includes(newPath.trim())) {
      setForm({ ...form, indexedPaths: [...form.indexedPaths, newPath.trim()] });
      setNewPath('');
    }
  };

  const handleRemovePath = (p: string) => {
    setForm({ ...form, indexedPaths: form.indexedPaths.filter((item) => item !== p) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">QuickKey Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* General */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              General & Appearance
            </h3>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Global Shortcut</label>
              <input
                type="text"
                value={form.globalShortcut}
                onChange={(e) => setForm({ ...form, globalShortcut: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Max Results</label>
                <input
                  type="number"
                  min={3}
                  max={25}
                  value={form.maxResults}
                  onChange={(e) => setForm({ ...form, maxResults: parseInt(e.target.value) || 9 })}
                  className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Theme</label>
                <select
                  value={form.theme}
                  onChange={(e: any) => setForm({ ...form, theme: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-sm text-white"
                >
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light</option>
                  <option value="system">System Synchronized</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Search Modules
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.enableFuzzySearch}
                  onChange={(e) => setForm({ ...form, enableFuzzySearch: e.target.checked })}
                  className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Intelligent Fuzzy Search Matching</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.enableCalculator}
                  onChange={(e) => setForm({ ...form, enableCalculator: e.target.checked })}
                  className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable In-Palette Mathematical Calculator</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.enableSystemCommands}
                  onChange={(e) => setForm({ ...form, enableSystemCommands: e.target.checked })}
                  className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enable Windows System Commands (Lock, Sleep, Shutdown)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={form.autoStartOnBoot}
                  onChange={(e) => setForm({ ...form, autoStartOnBoot: e.target.checked })}
                  className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Start Automatically on Windows Boot</span>
              </label>
            </div>
          </div>

          {/* Indexed Directories */}
          <div className="space-y-3 pt-3 border-t border-gray-800">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Indexed Directories
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="C:\Users\Name\Projects"
                className="flex-1 bg-gray-950 border border-gray-800 rounded px-3 py-1.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddPath}
                className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium"
              >
                Add Path
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {form.indexedPaths.map((path) => (
                <div
                  key={path}
                  className="flex items-center justify-between p-2 rounded bg-gray-950/60 border border-gray-800/60 text-xs"
                >
                  <span className="font-mono text-gray-300 truncate">{path}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePath(path)}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
