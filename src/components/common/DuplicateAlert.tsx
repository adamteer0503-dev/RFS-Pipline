import { AlertTriangle, X } from 'lucide-react';
import type { CRMRecord } from '../../types';
import { formatDate } from '../../utils/helpers';

interface Props {
  name: string;
  existing: CRMRecord[];
  onDismiss: () => void;
}

export function DuplicateAlert({ name, existing, onDismiss }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800">
            Duplicate name detected: &ldquo;{name}&rdquo;
          </p>
          <div className="mt-2 space-y-1">
            {existing.map((r) => (
              <div key={r.id} className="text-xs text-amber-700 flex items-center gap-2">
                <span className="font-medium">{r.name}</span>
                <span className="text-amber-500">·</span>
                <span>{r.sheetName}</span>
                {r.email && (
                  <>
                    <span className="text-amber-500">·</span>
                    <span>{r.email}</span>
                  </>
                )}
                {r.date && (
                  <>
                    <span className="text-amber-500">·</span>
                    <span>{formatDate(r.date)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-0.5 text-amber-500 hover:text-amber-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
