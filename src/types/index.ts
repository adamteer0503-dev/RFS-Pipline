export type RecordStatus = 'Lead' | 'Prospect' | 'Active' | 'Customer' | 'Inactive' | 'Closed';

export interface CRMRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: RecordStatus;
  date: string;
  owner: string;
  group: string;
  notes: string;
  // internal tracking
  sheetName: string;
  rowIndex: number; // 1-based row in the sheet (header is row 1, data starts at row 2)
  isDirty?: boolean;
}

export interface SheetTab {
  sheetId: number;
  title: string;
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSynced: Date | null;
  message: string;
}

export interface DuplicateAlert {
  existingRecord: CRMRecord;
  newName: string;
  sheet: string;
}

export interface CalendarInvitePayload {
  record: CRMRecord;
  executiveEmail: string;
}

export interface GoogleAuthState {
  isSignedIn: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
}
