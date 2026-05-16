import { useState, useMemo } from 'react';
import { Plus, Search, SortAsc, SortDesc } from 'lucide-react';
import type { CRMRecord, SheetTab } from '../../types';
import { CRMRow } from './CRMRow';
import { AddRowModal } from './AddRowModal';
import { LoadingSpinner } from '../common/LoadingSpinner';

type SortKey = keyof Pick<CRMRecord, 'name' | 'email' | 'role' | 'status' | 'date' | 'owner' | 'group'>;

interface Props {
  records: CRMRecord[];
  allRecords: CRMRecord[];
  tab: SheetTab | null;
  sheetName: string;
  showSheet?: boolean;
  loading?: boolean;
  onUpdate: (record: CRMRecord) => void;
  onSave: (record: CRMRecord) => void;
  onDelete: (record: CRMRecord) => void;
  onAdd: (partial: Omit<CRMRecord, 'id' | 'rowIndex'>) => Promise<CRMRecord | undefined>;
  onCreateInvite: (record: CRMRecord) => Promise<string | null>;
}

const COLUMNS: { key: SortKey; label: string; classes: string }[] = [
  { key: 'name',   label: 'Name',   classes: '' },
  { key: 'email',  label: 'Email',  classes: 'hidden md:table-cell' },
  { key: 'role',   label: 'Role',   classes: 'hidden lg:table-cell' },
  { key: 'status', label: 'Status', classes: '' },
  { key: 'date',   label: 'Date',   classes: 'hidden sm:table-cell' },
  { key: 'owner',  label: 'Owner',  classes: 'hidden xl:table-cell' },
  { key: 'group',  label: 'Group',  classes: 'hidden xl:table-cell' },
];

export function CRMTable({
  records,
  allRecords,
  tab: _tab,
  sheetName,
  showSheet = false,
  loading = false,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
  onCreateInvite,
}: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return records.filter((r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.group.toLowerCase().includes(q) ||
      r.notes.toLowerCase().includes(q),
    );
  }, [records, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] ?? '').toLowerCase();
      const bv = (b[sortKey] ?? '').toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records…"
            className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex-1" />
        <div className="text-xs text-gray-400">
          {filtered.length} of {records.length}
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add record</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">
              {search ? 'No matching records' : 'No records yet'}
            </p>
            {!search && (
              <p className="mt-1 text-xs text-gray-400">
                Click &ldquo;Add record&rdquo; to get started
              </p>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm border-b border-gray-100">
              <tr>
                {showSheet && (
                  <th className="table-head px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sheet
                  </th>
                )}
                {COLUMNS.map(({ key, label, classes }) => (
                  <th
                    key={key}
                    className={`table-head px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 ${classes}`}
                    onClick={() => toggleSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {sortKey === key && (
                        sortDir === 'asc'
                          ? <SortAsc className="h-3 w-3" />
                          : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="table-head px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden 2xl:table-cell">
                  Notes
                </th>
                <th className="table-head px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((record) => (
                <CRMRow
                  key={record.id}
                  record={record}
                  allRecords={allRecords}
                  onUpdate={onUpdate}
                  onSave={onSave}
                  onDelete={onDelete}
                  onCreateInvite={onCreateInvite}
                  showSheet={showSheet}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddRowModal
          sheetName={sheetName}
          existingRecords={allRecords}
          onAdd={onAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
