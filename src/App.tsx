import React, { useState, useEffect } from 'react';
import { CommandPalette } from './components/CommandPalette';
import { AppDiscoveryEngine } from './core/app_discovery';
import { SystemCommandsManager } from './core/system_commands';
import { FileIndexer } from './core/file_indexer';
import { CustomCommandService } from './core/custom_commands';
import { StorageService } from './core/storage';
import { CommandItem } from './types';

export const App: React.FC = () => {
  const [items, setItems] = useState<CommandItem[]>([]);
  const [customCmdService] = useState(() => new CustomCommandService(StorageService.getCustomCommands()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, systemCmds] = await Promise.all([
          AppDiscoveryEngine.discover(),
          Promise.resolve(SystemCommandsManager.getCommands())
        ]);

        const fileIndexer = new FileIndexer();
        const appItems = AppDiscoveryEngine.toCommandItems(apps);
        const fileItems = fileIndexer.toCommandItems();

        setItems([...appItems, ...fileItems, ...systemCmds]);
      } catch (e) {
        console.error('Error discovering items:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950/80 flex items-start justify-center pt-24 px-4 select-none">
      {loading ? (
        <div className="text-gray-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing QuickKey...</span>
        </div>
      ) : (
        <CommandPalette
          initialItems={items}
          customCommandService={customCmdService}
        />
      )}
    </div>
  );
};

export default App;
