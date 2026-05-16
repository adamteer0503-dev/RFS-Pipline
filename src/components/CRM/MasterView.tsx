import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import type { CRMRecord, SheetTab } from '../../types';
import { CRMTable } from './CRMTable';
import { STATUS_COLORS } from '../../constants';

interface Props {
  records: CRMRecord[];
  tabs: SheetTab[];
  onUpdate: (record: CRMRecord) => void;
  onSave: (record: CRMRecord) => void;
  onDelete: (record: CRMRecord) => void;
  onAdd: (partial: Omit<CRMRecord, 'id' | 'rowIndex'>) => Promise<CRMRecord | undefined>;
  onCreateInvite: (record: CRMRecord) => Promise<string | null>;
}

export function MasterView({
  records,
  tabs,
  onUpdate,
  onSave,
  onDelete,
  onAdd,
  onCreateInvite,
}: Props) {
  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const sheetCounts: Record<string, number> = {};
    for (const r of records) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
      sheetCounts[r.sheetName] = (sheetCounts[r.sheetName] ?? 0) + 1;
    }
    return { statusCounts, sheetCounts };
  }, [records]);

  return (
    <div className="flex flex-col h-full">
      {/* Stats strip */}
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Overview — {records.length} total records across {tabs.length} sheets
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.statusCounts).map(([status, count]) => (
            <div
              key={status}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}
            >
              {status}
              <span className="rounded-full bg-black/10 px-1.5">{count}</span>
            </div>
          ))}
          {Object.entries(stats.sheetCounts).map(([sheet, count]) => (
            <div
              key={sheet}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
            >
              {sheet}
              <span className="rounded-full bg-black/10 px-1.5">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full table with Sheet column */}
      <div className="flex-1 overflow-hidden">
        <CRMTable
          records={records}
          allRecords={records}
          tab={null}
          sheetName={tabs[0]?.title ?? ''}
          showSheet={true}
          onUpdate={onUpdate}
          onSave={onSave}
          onDelete={onDelete}
          onAdd={onAdd}
          onCreateInvite={onCreateInvite}
        />
      </div>
    </div>
  );
}
