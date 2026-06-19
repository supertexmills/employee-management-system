"use client";

import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api/client";

type SseHandler = (event: string, data: unknown) => void;

export function useSse(path: string, onEvent: SseHandler, enabled = true) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let buffer = "";

    async function connect() {
      try {
        const response = await fetch(`${getApiBaseUrl()}${path}`, {
          credentials: "include",
          headers: { Accept: "text/event-stream" },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          setConnected(false);
          return;
        }

        setConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
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
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setConnected(false);
        }
      } finally {
        setConnected(false);
      }
    }

    void connect();
    return () => controller.abort();
  }, [path, enabled]);

  return { connected };
}

export function useRfidStream(
  onEvent: SseHandler,
  params?: { department?: string; shift?: string },
  enabled = true
) {
  const query = new URLSearchParams();
  if (params?.department) query.set("department", params.department);
  if (params?.shift) query.set("shift", params.shift);
  const qs = query.toString();
  return useSse(`/rfid/events/stream${qs ? `?${qs}` : ""}`, onEvent, enabled);
}

export function useProductionStream(
  onEvent: SseHandler,
  params?: { department?: string; shift?: string; machineId?: string },
  enabled = true
) {
  const query = new URLSearchParams();
  if (params?.department) query.set("department", params.department);
  if (params?.shift) query.set("shift", params.shift);
  if (params?.machineId) query.set("machineId", params.machineId);
  const qs = query.toString();
  return useSse(`/v1/production/stream${qs ? `?${qs}` : ""}`, onEvent, enabled);
}
