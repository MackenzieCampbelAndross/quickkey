import React, { useState } from 'react';
import { CustomCommand } from '../types';

interface CustomCommandEditorProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CustomCommand[];
  onSave: (command: Omit<CustomCommand, 'id' | 'createdAt'>, id?: string) => void;
  onDelete: (id: string) => void;
}

export const CustomCommandEditor: React.FC<CustomCommandEditorProps> = ({
  isOpen,
  onClose,
  commands,
  onSave,
  onDelete
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('');
  const [category, setCategory] = useState<'terminal' | 'url' | 'script'>('url');
  const [payload, setPayload] = useState('');
  const [shortcut, setShortcut] = useState('');

  if (!isOpen) return null;

  const handleEdit = (cmd: CustomCommand) => {
    setEditingId(cmd.id);
    setName(cmd.name);
    setTrigger(cmd.trigger);
    setCategory(cmd.category);
    setPayload(cmd.payload);
    setShortcut(cmd.shortcut || '');
  };

  const handleReset = () => {
    setEditingId(null);
    setName('');
    setTrigger('');
    setCategory('url');
    setPayload('');
    setShortcut('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !payload.trim()) return;

    onSave(
      {
        name: name.trim(),
        trigger: trigger.trim() || name.toLowerCase().replace(/\s+/g, ''),
        category,
        payload: payload.trim(),
        shortcut: shortcut.trim() || undefined
      },
      editingId || undefined
    );

    handleReset();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Custom Command Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-950/60 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              {editingId ? 'Edit Command' : 'Create New Command'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Open Docs"
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="e.g. docs"
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Type</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="url">Web URL</option>
                  <option value="terminal">Terminal Command</option>
                  <option value="script">Script File</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Optional Shortcut</label>
                <input
                  type="text"
                  value={shortcut}
                  onChange={(e) => setShortcut(e.target.value)}
                  placeholder="e.g. Alt+D"
                  className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {category === 'url' ? 'URL Target' : 'Command Payload'}
              </label>
              <input
                type="text"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder={category === 'url' ? 'https://...' : 'npm run build'}
                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm text-white font-mono outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                {editingId ? 'Update Command' : 'Add Command'}
              </button>
            </div>
          </form>

          {/* Existing List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Custom Commands ({commands.length})
            </h3>

            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-950/40 border border-gray-800/80 text-sm"
              >
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <span>{cmd.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
                      {cmd.category}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{cmd.payload}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cmd)}
                    className="px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(cmd.id)}
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
