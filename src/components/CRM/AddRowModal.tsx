import { useState, useEffect } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import type { CRMRecord, RecordStatus } from '../../types';
import { STATUS_OPTIONS } from '../../constants';
import { isSameName } from '../../utils/helpers';
import { DuplicateAlert } from '../common/DuplicateAlert';

interface Props {
  sheetName: string;
  existingRecords: CRMRecord[];
  onAdd: (record: Omit<CRMRecord, 'id' | 'rowIndex'>) => Promise<CRMRecord | undefined>;
  onClose: () => void;
}

const EMPTY: Omit<CRMRecord, 'id' | 'rowIndex'> = {
  name: '',
  email: '',
  role: '',
  status: 'Lead',
  date: '',
  owner: '',
  group: '',
  notes: '',
  sheetName: '',
};

export function AddRowModal({ sheetName, existingRecords, onAdd, onClose }: Props) {
  const [form, setForm] = useState({ ...EMPTY, sheetName });
  const [duplicates, setDuplicates] = useState<CRMRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Detect duplicates as user types the name
  useEffect(() => {
    if (!form.name.trim()) { setDuplicates([]); return; }
    const found = existingRecords.filter((r) => isSameName(r.name, form.name));
    setDuplicates(found);
  }, [form.name, existingRecords]);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onAdd(form);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">
              Add record to <span className="text-brand-600">{sheetName}</span>
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Duplicate warning */}
        {duplicates.length > 0 && (
          <div className="px-5 pt-4">
            <DuplicateAlert
              name={form.name}
              existing={duplicates}
              onDismiss={() => setDuplicates([])}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className="input"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="input"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <input
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className="input"
                placeholder="Founder, Investor…"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as RecordStatus)}
                className="input"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Owner</label>
              <input
                value={form.owner}
                onChange={(e) => set('owner', e.target.value)}
                className="input"
                placeholder="Assigned to…"
              />
            </div>
            <div>
              <label className="label">Group</label>
              <input
                value={form.group}
                onChange={(e) => set('group', e.target.value)}
                className="input"
                placeholder="Cohort, team…"
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              className="input resize-none"
              placeholder="Any additional context…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Adding…' : 'Add record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
