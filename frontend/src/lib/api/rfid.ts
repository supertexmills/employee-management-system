import type {
  AttendanceDayRow,
  LiveSummary,
  ReaderStatus,
  RfidEvent,
} from "@/types/attendance";
import type { Department, Shift } from "@/lib/constants/departments";
import { apiListRequest } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type RfidStreamFilters = {
  department?: Department;
  shift?: Shift;
};

export type RfidStreamHandlers = {
  onSummary?: (summary: LiveSummary) => void;
  onEvent?: (event: RfidEvent) => void;
  onAttendanceRow?: (row: AttendanceDayRow) => void;
  onReaderStatus?: (status: ReaderStatus) => void;
  onOpen?: () => void;
  onError?: () => void;
};

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function connectRfidEventStream(
  handlers: RfidStreamHandlers,
  filters: RfidStreamFilters = {},
) {
  const query = buildQuery({
    department: filters.department,
    shift: filters.shift,
  });

  const es = new EventSource(`${API_URL}/api/rfid/events/stream${query}`, {
    withCredentials: true,
  });

  es.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  es.addEventListener("attendance:summary", (e) => {
    try {
      handlers.onSummary?.(JSON.parse(e.data) as LiveSummary);
    } catch {
      handlers.onError?.();
    }
  });

  es.addEventListener("rfid:event", (e) => {
    try {
      handlers.onEvent?.(JSON.parse(e.data) as RfidEvent);
    } catch {
      handlers.onError?.();
    }
  });

  es.addEventListener("attendance:row", (e) => {
    try {
      handlers.onAttendanceRow?.(JSON.parse(e.data) as AttendanceDayRow);
    } catch {
      handlers.onError?.();
    }
  });

  es.addEventListener("reader:status", (e) => {
    try {
      handlers.onReaderStatus?.(JSON.parse(e.data) as ReaderStatus);
    } catch {
      handlers.onError?.();
    }
  });

  es.onerror = () => {
    handlers.onError?.();
  };

  return () => {
    es.close();
  };
}

export async function listRecentRfidEvents(limit = 20) {
  const result = await apiListRequest<RfidEvent>(
    `/api/rfid/events?limit=${limit}`,
  );
  return result.data;
}
