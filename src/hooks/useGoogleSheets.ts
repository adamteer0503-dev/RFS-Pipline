import { useState, useCallback } from 'react';
import type { CRMRecord, SheetTab, SyncState } from '../types';
import {
  fetchSheetTabs,
  fetchSheetData,
  updateRecord,
  appendRecord,
  deleteRecord,
  createSheetTab,
  deleteSheetTab,
  ensureHeader,
  batchUpdateRecords,
} from '../utils/sheetsApi';
import { generateId } from '../utils/helpers';

export function useGoogleSheets(token: string | null) {
  const [tabs, setTabs] = useState<SheetTab[]>([]);
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSynced: null,
    message: '',
  });

  const setSyncing = () =>
    setSyncState({ status: 'syncing', lastSynced: null, message: 'Syncing…' });
  const setSuccess = (msg = 'Synced successfully') =>
    setSyncState({ status: 'success', lastSynced: new Date(), message: msg });
  const setError = (msg: string) =>
    setSyncState({ status: 'error', lastSynced: null, message: msg });

  /** Pull all data from Google Sheets */
  const pullFromSheets = useCallback(async () => {
    if (!token) return;
    setSyncing();
    try {
      const sheetTabs = await fetchSheetTabs(token);
      setTabs(sheetTabs);

      const allRecords: CRMRecord[] = [];
      for (const tab of sheetTabs) {
        const tabRecords = await fetchSheetData(token, tab.title);
        allRecords.push(...tabRecords);
      }
      setRecords(allRecords);
      setSuccess(`Pulled ${allRecords.length} records from ${sheetTabs.length} sheets`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Pull failed: ${message}`);
    }
  }, [token]);

  /** Push all dirty records to Google Sheets */
  const pushToSheets = useCallback(async () => {
    if (!token) return;
    setSyncing();
    try {
      const dirty = records.filter((r) => r.isDirty);
      if (dirty.length === 0) {
        setSuccess('Nothing to push — all records are up to date');
        return;
      }
      await batchUpdateRecords(token, dirty);
      setRecords((prev) => prev.map((r) => ({ ...r, isDirty: false })));
      setSuccess(`Pushed ${dirty.length} updated records`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Push failed: ${message}`);
    }
  }, [token, records]);

  /** Full bi-directional sync: push dirty, then pull fresh */
  const sync = useCallback(async () => {
    if (!token) return;
    setSyncing();
    try {
      const dirty = records.filter((r) => r.isDirty);
      if (dirty.length > 0) {
        await batchUpdateRecords(token, dirty);
      }
      const sheetTabs = await fetchSheetTabs(token);
      setTabs(sheetTabs);
      const allRecords: CRMRecord[] = [];
      for (const tab of sheetTabs) {
        const tabRecords = await fetchSheetData(token, tab.title);
        allRecords.push(...tabRecords);
      }
      setRecords(allRecords);
      setSuccess(
        `Sync complete — pushed ${dirty.length}, pulled ${allRecords.length} records`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Sync failed: ${message}`);
    }
  }, [token, records]);

  /** Update a record locally (marks as dirty) */
  const updateLocalRecord = useCallback((updated: CRMRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...updated, isDirty: true } : r)),
    );
  }, []);

  /** Add a new record to a sheet */
  const addRecord = useCallback(
    async (partial: Omit<CRMRecord, 'id' | 'rowIndex'>) => {
      if (!token) return;
      const newRecord: CRMRecord = { ...partial, id: generateId(), rowIndex: -1 };
      try {
        const rowIndex = await appendRecord(token, newRecord);
        const withRow = { ...newRecord, rowIndex, isDirty: false };
        setRecords((prev) => [...prev, withRow]);
        return withRow;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Add failed: ${message}`);
      }
    },
    [token],
  );

  /** Save a single record immediately to Sheets */
  const saveRecord = useCallback(
    async (record: CRMRecord) => {
      if (!token) return;
      try {
        await updateRecord(token, record);
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? { ...record, isDirty: false } : r)),
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Save failed: ${message}`);
      }
    },
    [token],
  );

  /** Remove a record from a sheet */
  const removeRecord = useCallback(
    async (record: CRMRecord) => {
      if (!token) return;
      const tab = tabs.find((t) => t.title === record.sheetName);
      if (!tab) return;
      try {
        await deleteRecord(token, record, tab.sheetId);
        // Re-index remaining records in same sheet (rows shift up)
        setRecords((prev) => {
          const filtered = prev.filter((r) => r.id !== record.id);
          return filtered.map((r) =>
            r.sheetName === record.sheetName && r.rowIndex > record.rowIndex
              ? { ...r, rowIndex: r.rowIndex - 1 }
              : r,
          );
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Delete failed: ${message}`);
      }
    },
    [token, tabs],
  );

  /** Create a new sheet tab */
  const addTab = useCallback(
    async (title: string) => {
      if (!token) return;
      try {
        const newTab = await createSheetTab(token, title);
        await ensureHeader(token, title);
        setTabs((prev) => [...prev, newTab]);
        return newTab;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Create tab failed: ${message}`);
      }
    },
    [token],
  );

  /** Delete a sheet tab and all its records */
  const removeTab = useCallback(
    async (tab: SheetTab) => {
      if (!token) return;
      try {
        await deleteSheetTab(token, tab.sheetId);
        setTabs((prev) => prev.filter((t) => t.sheetId !== tab.sheetId));
        setRecords((prev) => prev.filter((r) => r.sheetName !== tab.title));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Delete tab failed: ${message}`);
      }
    },
    [token],
  );

  return {
    tabs,
    records,
    syncState,
    pullFromSheets,
    pushToSheets,
    sync,
    updateLocalRecord,
    addRecord,
    saveRecord,
    removeRecord,
    addTab,
    removeTab,
  };
}
