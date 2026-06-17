import type { Department, Shift } from "@/lib/constants/departments";
import type {
  Machine,
  MachineRound,
  MachineSummaryResponse,
  ProductionFilters,
  ProductionLiveSnapshot,
  ProductionReaderStatus,
  ProductionRoundEvent,
  ProductionTodaySummary,
} from "@/types/production";
import { apiListRequest, apiRequest } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ProductionStreamFilters = ProductionFilters;

export type ProductionStreamHandlers = {
  onLive?: (snapshot: ProductionLiveSnapshot) => void;
  onRound?: (event: ProductionRoundEvent) => void;
  onReaderStatus?: (status: ProductionReaderStatus) => void;
  onOpen?: () => void;
  onError?: () => void;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function connectProductionStream(
  handlers: ProductionStreamHandlers,
  filters: ProductionStreamFilters = {},
) {
  const query = buildQuery({
    department: filters.department,
    shift: filters.shift,
    machineId: filters.machineId,
  });

  const es = new EventSource(`${API_URL}/api/v1/production/stream${query}`, {
    withCredentials: true,
  });

  es.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  es.addEventListener("production:live", (e) => {
    try {
      handlers.onLive?.(JSON.parse(e.data) as ProductionLiveSnapshot);
    } catch {
      handlers.onError?.();
    }
  });

  es.addEventListener("production:round", (e) => {
    try {
      handlers.onRound?.(JSON.parse(e.data) as ProductionRoundEvent);
    } catch {
      handlers.onError?.();
    }
  });

  es.addEventListener("reader:status", (e) => {
    try {
      handlers.onReaderStatus?.(JSON.parse(e.data) as ProductionReaderStatus);
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

export type ListRoundsParams = ProductionFilters & {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  epc?: string;
  employeeId?: string;
};

export type ListMachinesParams = {
  page?: number;
  limit?: number;
  department?: Department;
  isActive?: boolean;
};

export const productionApi = {
  live: (filters: ProductionFilters = {}) =>
    apiRequest<ProductionLiveSnapshot>(
      `/api/v1/production/live${buildQuery(filters as Record<string, string | undefined>)}`,
    ),

  todaySummary: (filters: ProductionFilters = {}) =>
    apiRequest<ProductionTodaySummary>(
      `/api/v1/production/summary/today${buildQuery(filters as Record<string, string | undefined>)}`,
    ),

  listRounds: (params: ListRoundsParams = {}) =>
    apiListRequest<MachineRound>(
      `/api/v1/production/rounds${buildQuery(params as Record<string, string | number | undefined>)}`,
    ),

  machineSummary: (machineId: string, filters: ProductionFilters = {}) =>
    apiRequest<MachineSummaryResponse>(
      `/api/v1/production/machines/${encodeURIComponent(machineId)}/summary${buildQuery(filters as Record<string, string | undefined>)}`,
    ),

  listMachines: (params: ListMachinesParams = {}) =>
    apiListRequest<Machine>(
      `/api/v1/production/machines${buildQuery(params)}`,
    ),

  getMachine: (machineId: string) =>
    apiRequest<Machine>(
      `/api/v1/production/machines/${encodeURIComponent(machineId)}`,
    ),

  readersStatus: () =>
    apiRequest<ProductionReaderStatus[]>(`/api/v1/production/readers/status`),
};
