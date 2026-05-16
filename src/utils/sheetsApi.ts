import type { CRMRecord, SheetTab } from '../types';
import { SPREADSHEET_ID, SHEETS_API_BASE, SHEET_COLUMNS } from '../constants';
import { rowToRecord, recordToRow, rowRange, columnLetter } from './helpers';

async function request<T>(
  url: string,
  options: RequestInit,
  token: string,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Fetch all sheet tabs from the spreadsheet */
export async function fetchSheetTabs(token: string): Promise<SheetTab[]> {
  const data = await request<{ sheets: { properties: { sheetId: number; title: string } }[] }>(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}?fields=sheets.properties`,
    { method: 'GET' },
    token,
  );
  return (data.sheets ?? []).map((s) => ({
    sheetId: s.properties.sheetId,
    title: s.properties.title,
  }));
}

/** Fetch all records from a specific sheet tab */
export async function fetchSheetData(token: string, sheetName: string): Promise<CRMRecord[]> {
  const escaped = sheetName.includes(' ') ? `'${sheetName}'` : sheetName;
  const last = columnLetter(SHEET_COLUMNS.length - 1);
  const range = `${escaped}!A1:${last}`;

  const data = await request<{ values?: string[][] }>(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`,
    { method: 'GET' },
    token,
  );

  const rows = data.values ?? [];
  if (rows.length === 0) return [];

  // Skip header row (index 0) — sheet row 1
  return rows.slice(1).map((row, idx) =>
    rowToRecord(row, idx + 2, sheetName), // rowIndex is 1-based; data starts at row 2
  );
}

/** Write a single record to the sheet (update existing row) */
export async function updateRecord(token: string, record: CRMRecord): Promise<void> {
  const range = rowRange(record.rowIndex, record.sheetName);
  await request(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({ range, majorDimension: 'ROWS', values: [recordToRow(record)] }),
    },
    token,
  );
}

/** Append a new record row to the bottom of a sheet */
export async function appendRecord(token: string, record: CRMRecord): Promise<number> {
  const escaped = record.sheetName.includes(' ') ? `'${record.sheetName}'` : record.sheetName;
  const last = columnLetter(SHEET_COLUMNS.length - 1);
  const range = `${escaped}!A:${last}`;

  const data = await request<{ updates: { updatedRange: string } }>(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({ range, majorDimension: 'ROWS', values: [recordToRow(record)] }),
    },
    token,
  );

  // Parse the row index from updatedRange (e.g. "Sheet1!A5:H5")
  const match = data.updates?.updatedRange?.match(/(\d+):/);
  return match ? parseInt(match[1], 10) : -1;
}

/** Delete a record row by clearing it and then shifting rows up via batchUpdate */
export async function deleteRecord(token: string, record: CRMRecord, sheetId: number): Promise<void> {
  // Use deleteDimension to remove the row entirely
  await request(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: record.rowIndex - 1, // 0-based
                endIndex: record.rowIndex,       // exclusive
              },
            },
          },
        ],
      }),
    },
    token,
  );
}

/** Ensure header row exists in a sheet */
export async function ensureHeader(token: string, sheetName: string): Promise<void> {
  const escaped = sheetName.includes(' ') ? `'${sheetName}'` : sheetName;
  const last = columnLetter(SHEET_COLUMNS.length - 1);
  const range = `${escaped}!A1:${last}1`;

  const existing = await request<{ values?: string[][] }>(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`,
    { method: 'GET' },
    token,
  );

  if (!existing.values || existing.values.length === 0) {
    await request(
      `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({ range, majorDimension: 'ROWS', values: [SHEET_COLUMNS] }),
      },
      token,
    );
  }
}

/** Create a new sheet tab */
export async function createSheetTab(token: string, title: string): Promise<SheetTab> {
  const data = await request<{ replies: { addSheet: { properties: { sheetId: number; title: string } } }[] }>(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    },
    token,
  );
  const props = data.replies[0].addSheet.properties;
  return { sheetId: props.sheetId, title: props.title };
}

/** Delete a sheet tab by sheetId */
export async function deleteSheetTab(token: string, sheetId: number): Promise<void> {
  await request(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({ requests: [{ deleteSheet: { sheetId } }] }),
    },
    token,
  );
}

/** Batch update multiple records (efficiency) */
export async function batchUpdateRecords(token: string, records: CRMRecord[]): Promise<void> {
  if (records.length === 0) return;
  const data = records.map((r) => ({
    range: rowRange(r.rowIndex, r.sheetName),
    majorDimension: 'ROWS',
    values: [recordToRow(r)],
  }));
  await request(
    `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data }),
    },
    token,
  );
}
