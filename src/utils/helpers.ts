import { v4 as uuidv4 } from 'uuid';
import type { CRMRecord, RecordStatus } from '../types';
import { SHEET_COLUMNS } from '../constants';

export function generateId(): string {
  return uuidv4();
}

/** Convert a raw sheet row array to a CRMRecord */
export function rowToRecord(
  row: string[],
  rowIndex: number,
  sheetName: string,
): CRMRecord {
  return {
    id: generateId(),
    name: row[0] ?? '',
    email: row[1] ?? '',
    role: row[2] ?? '',
    status: (row[3] as RecordStatus) ?? 'Lead',
    date: row[4] ?? '',
    owner: row[5] ?? '',
    group: row[6] ?? '',
    notes: row[7] ?? '',
    sheetName,
    rowIndex,
  };
}

/** Convert a CRMRecord back to a flat row array matching SHEET_COLUMNS order */
export function recordToRow(record: CRMRecord): string[] {
  return [
    record.name,
    record.email,
    record.role,
    record.status,
    record.date,
    record.owner,
    record.group,
    record.notes,
  ];
}

/** Column letter for a 0-based column index (A, B, …, Z, AA, …) */
export function columnLetter(index: number): string {
  let letter = '';
  let n = index;
  while (n >= 0) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
    n = Math.floor(n / 26) - 1;
  }
  return letter;
}

/** A1 notation range for a row (1-based) */
export function rowRange(rowIndex: number, sheetName: string): string {
  const last = columnLetter(SHEET_COLUMNS.length - 1);
  const escaped = sheetName.includes(' ') ? `'${sheetName}'` : sheetName;
  return `${escaped}!A${rowIndex}:${last}${rowIndex}`;
}

/** Check whether two strings are duplicates (case-insensitive, trimmed) */
export function isSameName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Format ISO date to a readable string */
export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Sleep helper for retry backoff */
export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
