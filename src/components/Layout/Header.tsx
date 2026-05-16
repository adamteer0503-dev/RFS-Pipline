import { Zap, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { SyncState } from '../../types';
import { SyncButton } from '../Sync/SyncButton';

interface Props {
  userName: string | null;
  userEmail: string | null;
  userPicture: string | null;
  syncState: SyncState;
  onSync: () => void;
  onPull: () => void;
  onPush: () => void;
  onSignOut: () => void;
}

export function Header({
  userName,
  userEmail,
  userPicture,
  syncState,
  onSync,
  onPull,
  onPush,
  onSignOut,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="hidden sm:block text-sm font-bold text-gray-900 tracking-tight">
          Run For Startups
        </span>
        <span className="hidden sm:block text-xs font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
          CRM
        </span>
      </div>

      <div className="flex-1" />

      {/* Sync controls */}
      <SyncButton
        syncState={syncState}
        onSync={onSync}
        onPull={onPull}
        onPush={onPush}
      />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          {userPicture ? (
            <img
              src={userPicture}
              alt={userName ?? ''}
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {(userName ?? userEmail ?? '?')[0].toUpperCase()}
            </div>
          )}
          <span className="hidden md:block max-w-[120px] truncate">{userName ?? userEmail}</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
              <div className="px-3 pb-1.5 pt-0.5 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); onSignOut(); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <LogOut className="h-4 w-4 text-gray-400" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
