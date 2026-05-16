import type { CRMRecord } from '../types';
import { CALENDAR_API_BASE } from '../constants';

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

/** Create a Google Calendar event and send invites to attendees */
export async function createCalendarEvent(
  token: string,
  record: CRMRecord,
  organizerEmail: string,
  executiveEmail: string,
): Promise<string> {
  // Parse the date — assume all-day event if no time component
  const dateStr = record.date;
  let start: Record<string, string>;
  let end: Record<string, string>;

  if (/T/.test(dateStr)) {
    // Has time component
    start = { dateTime: dateStr, timeZone: 'America/New_York' };
    const endTime = new Date(new Date(dateStr).getTime() + 60 * 60 * 1000).toISOString();
    end = { dateTime: endTime, timeZone: 'America/New_York' };
  } else {
    // All-day
    start = { date: dateStr };
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 1);
    end = { date: nextDay.toISOString().split('T')[0] };
  }

  const attendees = [
    { email: organizerEmail },
    ...(record.email ? [{ email: record.email }] : []),
    ...(executiveEmail && executiveEmail !== organizerEmail ? [{ email: executiveEmail }] : []),
  ].filter((a, i, arr) => arr.findIndex((b) => b.email === a.email) === i);

  const event = {
    summary: `RFS — ${record.name}${record.role ? ` (${record.role})` : ''}`,
    description: `CRM Note: ${record.notes || 'N/A'}\nStatus: ${record.status}\nOwner: ${record.owner}\nGroup: ${record.group}`,
    start,
    end,
    attendees,
    guestsCanModify: false,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const data = await request<{ id: string; htmlLink: string }>(
    `${CALENDAR_API_BASE}/calendars/primary/events?sendUpdates=all`,
    { method: 'POST', body: JSON.stringify(event) },
    token,
  );

  return data.htmlLink ?? data.id;
}
