import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useGoogleSheets } from './hooks/useGoogleSheets';
import { useGoogleCalendar } from './hooks/useGoogleCalendar';
import { GoogleSignIn } from './components/Auth/GoogleSignIn';
import { Header } from './components/Layout/Header';
import { TabNav } from './components/Layout/TabNav';
import { CRMTable } from './components/CRM/CRMTable';
import { MasterView } from './components/CRM/MasterView';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { MASTER_TAB } from './constants';
import type { CRMRecord, SheetTab } from './types';

export default function App() {
  const { auth, signIn, signOut } = useGoogleAuth();
  const {
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
  } = useGoogleSheets(auth.accessToken);

  const { createInvite } = useGoogleCalendar(auth.accessToken, auth.userEmail);

  const [activeTab, setActiveTab] = useState<string>(MASTER_TAB);
  const [initialLoading, setInitialLoading] = useState(false);

  // Auto-pull on sign-in
  useEffect(() => {
    if (auth.isSignedIn && auth.accessToken) {
      setInitialLoading(true);
      pullFromSheets().finally(() => setInitialLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isSignedIn, auth.accessToken]);

  // Keep active tab valid
  useEffect(() => {
    if (activeTab !== MASTER_TAB && tabs.length > 0) {
      if (!tabs.find((t) => t.title === activeTab)) {
        setActiveTab(tabs[0].title);
      }
    }
  }, [tabs, activeTab]);

  // Toast on sync state changes
  useEffect(() => {
    if (syncState.status === 'success') toast.success(syncState.message);
    if (syncState.status === 'error') toast.error(syncState.message);
  }, [syncState.status, syncState.message]);

  const handleAddTab = useCallback(
    async (title: string) => {
      const newTab = await addTab(title);
      if (newTab) {
        setActiveTab(newTab.title);
        toast.success(`Created sheet "${title}"`);
      }
    },
    [addTab],
  );

  const handleDeleteTab = useCallback(
    async (tab: SheetTab) => {
      await removeTab(tab);
      toast.success(`Deleted sheet "${tab.title}"`);
    },
    [removeTab],
  );

  const handleSaveRecord = useCallback(
    async (record: CRMRecord) => {
      await saveRecord(record);
    },
    [saveRecord],
  );

  const handleDeleteRecord = useCallback(
    async (record: CRMRecord) => {
      await removeRecord(record);
      toast.success(`Deleted "${record.name}"`);
    },
    [removeRecord],
  );

  const handleAddRecord = useCallback(
    async (partial: Omit<CRMRecord, 'id' | 'rowIndex'>) => {
      const added = await addRecord(partial);
      if (added) toast.success(`Added "${added.name}"`);
      return added;
    },
    [addRecord],
  );

  const handleCreateInvite = useCallback(
    async (record: CRMRecord) => {
      const link = await createInvite(record);
      if (link) {
        toast.success('Calendar invite created!');
      } else {
        toast.error('Could not create calendar invite');
      }
      return link;
    },
    [createInvite],
  );

  if (!auth.isSignedIn) {
    return <GoogleSignIn onSignIn={signIn} />;
  }

  const activeTabObj = tabs.find((t) => t.title === activeTab) ?? null;
  const activeRecords =
    activeTab === MASTER_TAB
      ? records
      : records.filter((r) => r.sheetName === activeTab);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />

      <Header
        userName={auth.userName}
        userEmail={auth.userEmail}
        userPicture={auth.userPicture}
        syncState={syncState}
        onSync={sync}
        onPull={pullFromSheets}
        onPush={pushToSheets}
        onSignOut={signOut}
      />

      <TabNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddTab={handleAddTab}
        onDeleteTab={handleDeleteTab}
      />

      <main className="flex-1 overflow-hidden">
        {initialLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <LoadingSpinner size="lg" />
            <p className="text-sm">Loading your CRM data…</p>
          </div>
        ) : activeTab === MASTER_TAB ? (
          <MasterView
            records={records}
            tabs={tabs}
            onUpdate={updateLocalRecord}
            onSave={handleSaveRecord}
            onDelete={handleDeleteRecord}
            onAdd={handleAddRecord}
            onCreateInvite={handleCreateInvite}
          />
        ) : (
          <CRMTable
            records={activeRecords}
            allRecords={records}
            tab={activeTabObj}
            sheetName={activeTab}
            onUpdate={updateLocalRecord}
            onSave={handleSaveRecord}
            onDelete={handleDeleteRecord}
            onAdd={handleAddRecord}
            onCreateInvite={handleCreateInvite}
          />
        )}
      </main>
    </div>
  );
}
