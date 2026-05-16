import { RefreshCw, CloudUpload, CloudDownload, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { SyncState } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Props {
  syncState: SyncState;
  onSync: () => void;
  onPull: () => void;
  onPush: () => void;
}

export function SyncButton({ syncState, onSync, onPull, onPush }: Props) {
  const isSyncing = syncState.status === 'syncing';

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator */}
      {syncState.status !== 'idle' && (
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs">
          {syncState.status === 'syncing' && (
            <LoadingSpinner size="sm" />
          )}
          {syncState.status === 'success' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}
          {syncState.status === 'error' && (
            <XCircle className="h-3.5 w-3.5 text-red-500" />
          )}
          <span
            className={
              syncState.status === 'error'
                ? 'text-red-600'
                : syncState.status === 'success'
                ? 'text-green-700'
                : 'text-gray-600'
            }
          >
            {syncState.message}
          </span>
        </div>
      )}

      {syncState.lastSynced && (
        <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>
            {syncState.lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Pull */}
      <button
        onClick={onPull}
        disabled={isSyncing}
        title="Pull from Google Sheets"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
      >
        <CloudDownload className="h-4 w-4" />
        <span className="hidden sm:inline">Pull</span>
      </button>

      {/* Push */}
      <button
        onClick={onPush}
        disabled={isSyncing}
        title="Push to Google Sheets"
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand-300 hover:text-brand-600 disabled:opacity-50"
      >
        <CloudUpload className="h-4 w-4" />
        <span className="hidden sm:inline">Push</span>
      </button>

      {/* Full sync */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-95 disabled:opacity-50"
      >
        {isSyncing ? (
          <LoadingSpinner size="sm" className="border-white/30 border-t-white" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Sync
      </button>
    </div>
  );
}
