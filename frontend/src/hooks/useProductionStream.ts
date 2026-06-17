"use client";

import {
  connectProductionStream,
  productionApi,
  type ProductionStreamFilters,
} from "@/lib/api/production";
import type {
  ProductionLiveSnapshot,
  ProductionReaderStatus,
  ProductionRoundEvent,
} from "@/types/production";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECENT_ROUNDS = 20;
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

export type UseProductionStreamOptions = {
  enabled: boolean;
  filters?: ProductionStreamFilters;
};

export function useProductionStream({
  enabled,
  filters = {},
}: UseProductionStreamOptions) {
  const [liveSnapshot, setLiveSnapshot] = useState<ProductionLiveSnapshot | null>(
    null,
  );
  const [recentRounds, setRecentRounds] = useState<ProductionRoundEvent[]>([]);
  const [readerStatus, setReaderStatus] = useState<ProductionReaderStatus | null>(
    null,
  );
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersKey = `${filters.department ?? ""}:${filters.shift ?? ""}:${filters.machineId ?? ""}`;

  const hydrate = useCallback(async () => {
    try {
      const result = await productionApi.listRounds({
        ...filters,
        limit: MAX_RECENT_ROUNDS,
      });
      const rounds: ProductionRoundEvent[] = result.data.map((round) => ({
        roundKey: round.roundKey,
        machineId: round.machineId,
        employee: round.employee
          ? {
              _id: round.employee,
              employeeId: round.employeeId ?? "",
              employeeName: round.employeeName,
              department: round.department ?? "Production",
              shift: round.shift,
            }
          : null,
        shiftHourLabel: round.shiftHourLabel,
        shiftHourIndex: round.shiftHourIndex,
        roundsThisHour: null,
        totalRoundsShift: null,
        detectedAt: round.detectedAt,
        factoryDate: round.factoryDate,
        shift: round.shift,
      }));
      setRecentRounds(rounds.slice(0, MAX_RECENT_ROUNDS));
    } catch {
      // Keep stream-only updates if hydration fails.
    }
  }, [filters]);

  useEffect(() => {
    if (!enabled) return;

    setLiveSnapshot(null);
    setReconnecting(true);

    let disconnect: (() => void) | null = null;
    let cancelled = false;

    const scheduleReconnect = () => {
      if (cancelled) return;
      setConnected(false);
      setReconnecting(true);

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt);
      reconnectAttemptRef.current = attempt + 1;

      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      if (cancelled) return;

      disconnect?.();
      disconnect = connectProductionStream(
        {
          onOpen: () => {
            reconnectAttemptRef.current = 0;
            setConnected(true);
            setReconnecting(false);
            void hydrate();
          },
          onLive: (data) => {
            setConnected(true);
            setReconnecting(false);
            setLiveSnapshot(data);
          },
          onRound: (event) => {
            setConnected(true);
            setReconnecting(false);
            setRecentRounds((prev) => [event, ...prev].slice(0, MAX_RECENT_ROUNDS));
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
  }, [enabled, filtersKey, hydrate]);

  return {
    liveSnapshot,
    recentRounds,
    readerStatus,
    connected,
    reconnecting,
  };
}
