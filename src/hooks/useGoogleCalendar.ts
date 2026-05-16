import { useState, useCallback } from 'react';
import type { CRMRecord } from '../types';
import { createCalendarEvent } from '../utils/calendarApi';
import { EXECUTIVE_EMAIL } from '../constants';

interface CalendarState {
  pending: boolean;
  lastLink: string | null;
  error: string | null;
}

export function useGoogleCalendar(token: string | null, organizerEmail: string | null) {
  const [state, setState] = useState<CalendarState>({
    pending: false,
    lastLink: null,
    error: null,
  });

  const createInvite = useCallback(
    async (record: CRMRecord) => {
      if (!token || !organizerEmail) return null;
      if (!record.email || !record.date) return null;

      setState({ pending: true, lastLink: null, error: null });
      try {
        const link = await createCalendarEvent(
          token,
          record,
          organizerEmail,
          EXECUTIVE_EMAIL,
        );
        setState({ pending: false, lastLink: link, error: null });
        return link;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setState({ pending: false, lastLink: null, error: message });
        return null;
      }
    },
    [token, organizerEmail],
  );

  return { calendarState: state, createInvite };
}
