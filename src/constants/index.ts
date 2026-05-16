export const SPREADSHEET_ID = '1FMhSyBzUASC9MzJtEI6jzLzteG4flXxLtH4Cbi_SlWU';

export const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.events',
  'email',
  'profile',
].join(' ');

// Column order in the Google Sheet (0-indexed)
export const SHEET_COLUMNS = ['Name', 'Email', 'Role', 'Status', 'Date', 'Owner', 'Group', 'Notes'];

export const STATUS_OPTIONS = ['Lead', 'Prospect', 'Active', 'Customer', 'Inactive', 'Closed'] as const;

export const STATUS_COLORS: Record<string, string> = {
  Lead:     'bg-purple-100 text-purple-800 ring-purple-200',
  Prospect: 'bg-blue-100 text-blue-800 ring-blue-200',
  Active:   'bg-green-100 text-green-800 ring-green-200',
  Customer: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Inactive: 'bg-gray-100 text-gray-600 ring-gray-200',
  Closed:   'bg-red-100 text-red-700 ring-red-200',
};

export const GOOGLE_CLIENT_ID = '513681181002-r7vhj4ubir9b6gt9k5sheoruqkgaf32t.apps.googleusercontent.com';

export const EXECUTIVE_EMAIL = 'adamteer0503@gmail.com';

export const MASTER_TAB = '__master__';
