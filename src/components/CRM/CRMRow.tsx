import { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2, Trash2, CalendarPlus, ExternalLink, AlertTriangle } from 'lucide-react';
import type { CRMRecord, RecordStatus } from '../../types';
import { STATUS_OPTIONS, STATUS_COLORS } from '../../constants';
import { formatDate, isSameName } from '../../utils/helpers';

interface Props {
  record: CRMRecord;
  allRecords: CRMRecord[];
  onUpdate: (record: CRMRecord) => void;
  onSave: (record: CRMRecord) => void;
  onDelete: (record: CRMRecord) => void;
  onCreateInvite: (record: CRMRecord) => Promise<string | null>;
  showSheet?: boolean;
}

export function CRMRow({
  record,
  allRecords,
  onUpdate,
  onSave,
  onDelete,
  onCreateInvite,
  showSheet = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CRMRecord>(record);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && nameRef.current) nameRef.current.focus();
  }, [editing]);

  // Sync draft with record when not editing
  useEffect(() => {
    if (!editing) setDraft(record);
  }, [record, editing]);

  function setField<K extends keyof CRMRecord>(key: K, value: CRMRecord[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleEdit() {
    setDraft(record);
    setEditing(true);
  }

  function handleCancel() {
    setDraft(record);
    setEditing(false);
  }

  function handleSave() {
    onUpdate(draft);
    onSave(draft);
    setEditing(false);
  }

  async function handleInvite() {
    setCreatingInvite(true);
    const link = await onCreateInvite(record);
    if (link) setInviteLink(link);
    setCreatingInvite(false);
  }

  const hasDuplicate =
    editing &&
    draft.name.trim() &&
    allRecords.some(
      (r) => r.id !== record.id && isSameName(r.name, draft.name),
    );

  const canInvite = !!record.email && !!record.date;

  return (
    <>
      <tr
        className={`group transition-colors hover:bg-gray-50 ${
          record.isDirty ? 'bg-amber-50/50' : ''
        } ${editing ? 'bg-brand-50/30' : ''}`}
      >
        {/* Sheet column (master view) */}
        {showSheet && (
          <td className="table-cell px-3">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {record.sheetName}
            </span>
          </td>
        )}

        {/* Name */}
        <td className="table-cell px-3">
          {editing ? (
            <div className="relative">
              <input
                ref={nameRef}
                value={draft.name}
                onChange={(e) => setField('name', e.target.value)}
                className={`edit-input ${hasDuplicate ? 'border-amber-400 ring-amber-200' : ''}`}
                placeholder="Name"
              />
              {hasDuplicate && (
                <AlertTriangle className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-500" />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900">{record.name}</span>
              {record.isDirty && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
              )}
            </div>
          )}
        </td>

        {/* Email */}
        <td className="table-cell px-3 hidden md:table-cell">
          {editing ? (
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setField('email', e.target.value)}
              className="edit-input"
              placeholder="email@example.com"
            />
          ) : (
            <span className="text-gray-500 text-sm">{record.email}</span>
          )}
        </td>

        {/* Role */}
        <td className="table-cell px-3 hidden lg:table-cell">
          {editing ? (
            <input
              value={draft.role}
              onChange={(e) => setField('role', e.target.value)}
              className="edit-input"
              placeholder="Role"
            />
          ) : (
            <span className="text-gray-600 text-sm">{record.role}</span>
          )}
        </td>

        {/* Status */}
        <td className="table-cell px-3">
          {editing ? (
            <select
              value={draft.status}
              onChange={(e) => setField('status', e.target.value as RecordStatus)}
              className="edit-input"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[record.status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}
            >
              {record.status}
            </span>
          )}
        </td>

        {/* Date */}
        <td className="table-cell px-3 hidden sm:table-cell">
          {editing ? (
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setField('date', e.target.value)}
              className="edit-input"
            />
          ) : (
            <span className="text-gray-500 text-sm">{formatDate(record.date)}</span>
          )}
        </td>

        {/* Owner */}
        <td className="table-cell px-3 hidden xl:table-cell">
          {editing ? (
            <input
              value={draft.owner}
              onChange={(e) => setField('owner', e.target.value)}
              className="edit-input"
              placeholder="Owner"
            />
          ) : (
            <span className="text-gray-600 text-sm">{record.owner}</span>
          )}
        </td>

        {/* Group */}
        <td className="table-cell px-3 hidden xl:table-cell">
          {editing ? (
            <input
              value={draft.group}
              onChange={(e) => setField('group', e.target.value)}
              className="edit-input"
              placeholder="Group"
            />
          ) : (
            <span className="text-gray-600 text-sm">{record.group}</span>
          )}
        </td>

        {/* Notes */}
        <td className="table-cell px-3 hidden 2xl:table-cell max-w-[200px]">
          {editing ? (
            <input
              value={draft.notes}
              onChange={(e) => setField('notes', e.target.value)}
              className="edit-input"
              placeholder="Notes"
            />
          ) : (
            <span className="text-gray-500 text-sm truncate block">{record.notes}</span>
          )}
        </td>

        {/* Actions */}
        <td className="table-cell px-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  title="Save"
                  className="action-btn text-green-600 hover:bg-green-50"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleCancel}
                  title="Cancel"
                  className="action-btn text-gray-400 hover:bg-gray-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                {canInvite && (
                  <button
                    onClick={handleInvite}
                    disabled={creatingInvite}
                    title="Create calendar invite"
                    className="action-btn text-brand-500 hover:bg-brand-50 hidden sm:flex"
                  >
                    {inviteLink ? (
                      <a
                        href={inviteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-green-500" />
                      </a>
                    ) : (
                      <CalendarPlus className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
                <button
                  onClick={handleEdit}
                  title="Edit"
                  className="action-btn text-gray-400 hover:text-brand-600 hover:bg-brand-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete"
                  className="action-btn text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Delete confirmation row */}
      {showDeleteConfirm && (
        <tr>
          <td colSpan={12} className="bg-red-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-red-700">
                Delete <strong>{record.name}</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(record); setShowDeleteConfirm(false); }}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
