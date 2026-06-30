"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/client";

type SseHandler = (event: string, data: unknown) => void;

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

export function useSse(path: string, onEvent: SseHandler, enabled = true) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let buffer = "";
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryAttempt = 0;
    let stopped = false;

    function scheduleReconnect(connectFn: () => void) {
      if (stopped) return;
      const delay = Math.min(MAX_RETRY_MS, INITIAL_RETRY_MS * 2 ** retryAttempt);
      retryAttempt += 1;
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        void connectFn();
      }, delay);
    }

    async function connect() {
      if (stopped) return;

      try {
        const response = await fetch(`${getApiBaseUrl()}${path}`, {
          credentials: "include",
          headers: { Accept: "text/event-stream" },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          setConnected(false);
          scheduleReconnect(connect);
          return;
        }

        retryAttempt = 0;
        setConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            if (part.startsWith(":")) continue;

            const lines = part.split("\n");
            let event = "message";
            let data = "";

            for (const line of lines) {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              if (line.startsWith("data:")) data += line.slice(5).trim();
            }

            if (data) {
              try {
                onEventRef.current(event, JSON.parse(data));
              } catch {
                onEventRef.current(event, data);
              }
            }
          }
        }

        if (!stopped) {
          setConnected(false);
          scheduleReconnect(connect);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError" || stopped) return;
        setConnected(false);
        scheduleReconnect(connect);
      }
    }

    void connect();

    return () => {
      stopped = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      controller.abort();
      setConnected(false);
    };
  }, [path, enabled]);

  return { connected };
}

export function useProductionStream(
  onEvent: SseHandler,
  params?: { department?: string; shift?: string; machineId?: string },
  enabled = true
) {
  const path = useMemo(() => {
    const query = new URLSearchParams();
    if (params?.department) query.set("department", params.department);
    if (params?.shift) query.set("shift", params.shift);
    if (params?.machineId) query.set("machineId", params.machineId);
    const qs = query.toString();
    return `/v1/production/stream${qs ? `?${qs}` : ""}`;
  }, [params?.department, params?.shift, params?.machineId]);

  return useSse(path, onEvent, enabled);
}
