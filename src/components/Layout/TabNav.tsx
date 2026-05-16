import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import type { SheetTab } from '../../types';
import { MASTER_TAB } from '../../constants';

interface Props {
  tabs: SheetTab[];
  activeTab: string;
  onTabChange: (title: string) => void;
  onAddTab: (title: string) => void;
  onDeleteTab: (tab: SheetTab) => void;
}

export function TabNav({ tabs, activeTab, onTabChange, onAddTab, onDeleteTab }: Props) {
  const [newTabName, setNewTabName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<SheetTab | null>(null);

  function handleAdd() {
    const name = newTabName.trim();
    if (!name) return;
    onAddTab(name);
    setNewTabName('');
    setShowNew(false);
  }

  return (
    <nav className="flex items-center gap-1 border-b border-gray-200 bg-white px-4 overflow-x-auto">
      {/* Master tab */}
      <button
        onClick={() => onTabChange(MASTER_TAB)}
        className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
          activeTab === MASTER_TAB
            ? 'border-brand-600 text-brand-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Master
      </button>

      <div className="h-5 w-px bg-gray-200 mx-1 flex-shrink-0" />

      {/* Dynamic sheet tabs */}
      {tabs.map((tab) => (
        <div key={tab.sheetId} className="group flex items-center flex-shrink-0">
          <button
            onClick={() => onTabChange(tab.title)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.title
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.title}
          </button>
          {tabs.length > 1 && (
            <button
              onClick={() => setDeleteConfirm(tab)}
              title={`Delete ${tab.title}`}
              className="hidden group-hover:flex items-center justify-center h-5 w-5 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}

      {/* Add new tab */}
      <div className="flex items-center ml-1 flex-shrink-0">
        {showNew ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
            className="flex items-center gap-1"
          >
            <input
              autoFocus
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setShowNew(false)}
              placeholder="Sheet name…"
              className="h-7 w-32 rounded border border-brand-300 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded px-1.5 py-1 text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            title="Add new sheet tab"
            className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add tab
          </button>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-gray-900">Delete &ldquo;{deleteConfirm.title}&rdquo;?</h3>
            <p className="mt-1 text-sm text-gray-500">
              This will permanently delete the sheet tab and all its records from Google Sheets. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDeleteTab(deleteConfirm); setDeleteConfirm(null); }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete tab
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
