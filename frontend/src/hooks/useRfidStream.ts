"use client";

import { connectRfidEventStream } from "@/lib/api/rfid";
import type { LiveSummary, RfidEvent } from "@/types/attendance";
import { useEffect, useRef, useState } from "react";

const MAX_RECENT_EVENTS = 20;

export function useRfidStream(enabled: boolean) {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [recentEvents, setRecentEvents] = useState<RfidEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let disconnect: (() => void) | null = null;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      disconnect?.();
      disconnect = connectRfidEventStream({
        onSummary: (data) => {
          setConnected(true);
          setSummary(data);
        },
        onEvent: (event) => {
          setConnected(true);
          setRecentEvents((prev) => [event, ...prev].slice(0, MAX_RECENT_EVENTS));
        },
        onError: () => {
          setConnected(false);
          if (!cancelled) {
            reconnectRef.current = setTimeout(connect, 5000);
          }
        },
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      disconnect?.();
    };
  }, [enabled]);

  return { summary, recentEvents, connected };
}
