"use client";

import { attendanceApi } from "@/lib/api/attendance";
import {
  connectRfidEventStream,
  listRecentRfidEvents,
  type RfidStreamFilters,
} from "@/lib/api/rfid";
import type { AttendanceDayRow, LiveSummary, ReaderStatus, RfidEvent } from "@/types/attendance";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECENT_EVENTS = 20;
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

function upsertSnapshotRow(
  rows: AttendanceDayRow[],
  incoming: AttendanceDayRow,
  limit: number,
): AttendanceDayRow[] {
  const incomingEmployeeId =
    typeof incoming.employee === "object" ? incoming.employee._id : incoming.employee;

  const next = rows.filter((row) => {
    const rowEmployeeId =
      typeof row.employee === "object" ? row.employee?._id : row.employee;
    return rowEmployeeId !== incomingEmployeeId;
  });

  next.unshift(incoming);

  return next
    .sort((a, b) => {
      const aTime = a.firstEntryAt ? new Date(a.firstEntryAt).getTime() : 0;
      const bTime = b.firstEntryAt ? new Date(b.firstEntryAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

export type UseRfidStreamOptions = {
  enabled: boolean;
  filters?: RfidStreamFilters;
  snapshotLimit?: number;
  hydrateSnapshot?: boolean;
};

export function useRfidStream({
  enabled,
  filters = {},
  snapshotLimit = 8,
  hydrateSnapshot = false,
}: UseRfidStreamOptions) {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<RfidEvent[]>([]);
  const [snapshotRows, setSnapshotRows] = useState<AttendanceDayRow[]>([]);
  const [readerStatus, setReaderStatus] = useState<ReaderStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersKey = `${filters.department ?? ""}:${filters.shift ?? ""}`;

  const hydrate = useCallback(async () => {
    try {
      const [events, floor] = await Promise.all([
        listRecentRfidEvents(MAX_RECENT_EVENTS),
        hydrateSnapshot
          ? attendanceApi.liveFloor({
              ...filters,
              page: 1,
              limit: snapshotLimit,
            })
          : Promise.resolve(null),
      ]);

      setRecentEvents(events.slice(0, MAX_RECENT_EVENTS));
      if (floor) {
        setSnapshotRows(floor.data);
      }
    } catch {
      // Keep stream-only updates if hydration fails.
    }
  }, [filters, hydrateSnapshot, snapshotLimit]);

  useEffect(() => {
    if (!enabled) return;

    setSummary(null);
    setSnapshotRows([]);
    setReconnecting(true);

    let disconnect: (() => void) | null = null;
    let cancelled = false;

    const scheduleReconnect = () => {
      if (cancelled) return;
      setConnected(false);
      setReconnecting(true);

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        RECONNECT_MAX_MS,
        RECONNECT_BASE_MS * 2 ** attempt,
      );
      reconnectAttemptRef.current = attempt + 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      if (cancelled) return;

      disconnect?.();
      disconnect = connectRfidEventStream(
        {
          onOpen: () => {
            reconnectAttemptRef.current = 0;
            setConnected(true);
            setReconnecting(false);
            void hydrate();
          },
          onSummary: (data) => {
            setConnected(true);
            setReconnecting(false);
            setSummary(data);
          },
          onEvent: (event) => {
            setConnected(true);
            setReconnecting(false);
            setRecentEvents((prev) => [event, ...prev].slice(0, MAX_RECENT_EVENTS));
          },
          onAttendanceRow: (row) => {
            setSnapshotRows((prev) => upsertSnapshotRow(prev, row, snapshotLimit));
          },
          onReaderStatus: (status) => {
            setReaderStatus(status);
          },
          onError: scheduleReconnect,
        },
        filters,
      );
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      disconnect?.();
      setConnected(false);
      setReconnecting(false);
    };
  }, [enabled, filtersKey, hydrate, snapshotLimit]);

  return {
    summary,
    recentEvents,
    snapshotRows,
    readerStatus,
    connected,
    reconnecting,
  };
}
