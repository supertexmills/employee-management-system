import type { LiveSummary, ReaderStatus, RfidEvent } from "@/types/attendance";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type RfidStreamHandlers = {
  onSummary?: (summary: LiveSummary) => void;
  onEvent?: (event: RfidEvent) => void;
  onReaderStatus?: (status: ReaderStatus) => void;
  onError?: () => void;
};

export function connectRfidEventStream(handlers: RfidStreamHandlers) {
  const es = new EventSource(`${API_URL}/api/rfid/events/stream`, {
    withCredentials: true,
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
