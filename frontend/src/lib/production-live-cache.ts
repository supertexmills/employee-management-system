import type { QueryClient } from "@tanstack/react-query";
import type { Shift } from "@/lib/constants";
import type {
  ApiResponse,
  MachineRound,
  ProductionLive,
  ProductionSummary,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export type ProductionFilters = {
  department?: string;
  shift?: string;
  machineId?: string;
};

export interface ProductionRoundEvent {
  roundKey: string;
  machineId: string;
  machineName?: string;
  employee: {
    _id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    shift: Shift;
  } | null;
  shiftHourLabel: string;
  shiftHourIndex: number;
  roundsThisHour: number | null;
  totalRoundsShift: number | null;
  detectedAt: string;
  factoryDate: string;
  shift: Shift;
}

function matchesFilters(
  round: ProductionRoundEvent,
  filters: ProductionFilters
): boolean {
  if (filters.machineId && round.machineId !== filters.machineId) return false;
  if (filters.department && round.employee?.department !== filters.department) {
    return false;
  }
  if (filters.shift && round.shift !== filters.shift) return false;
  return true;
}

export function patchLiveFromSnapshot(
  queryClient: QueryClient,
  filters: ProductionFilters,
  data: ProductionLive
) {
  queryClient.setQueryData<ApiResponse<ProductionLive>>(
    queryKeys.productionLive(filters),
    { success: true, data }
  );
}

export function applyRoundEvent(
  queryClient: QueryClient,
  filters: ProductionFilters,
  round: ProductionRoundEvent
) {
  if (!matchesFilters(round, filters)) return;

  queryClient.setQueryData<ApiResponse<ProductionLive>>(
    queryKeys.productionLive(filters),
    (prev) => {
      if (!prev?.data) return prev;

      const machines = prev.data.machines.map((machine) => {
        if (machine.machineId !== round.machineId) return machine;

        return {
          ...machine,
          lastRoundAt: round.detectedAt,
          roundsThisHour: round.roundsThisHour ?? machine.roundsThisHour + 1,
          totalRoundsShift: round.totalRoundsShift ?? machine.totalRoundsShift + 1,
          activeEmployees:
            round.employee && machine.activeEmployees === 0
              ? 1
              : machine.activeEmployees,
        };
      });

      const totals = {
        roundsThisHour: machines.reduce((sum, m) => sum + m.roundsThisHour, 0),
        roundsTodayShift: machines.reduce((sum, m) => sum + m.totalRoundsShift, 0),
      };

      return {
        ...prev,
        data: {
          ...prev.data,
          machines,
          totals,
          updatedAt: new Date().toISOString(),
        },
      };
    }
  );

  queryClient.setQueryData<ApiResponse<ProductionSummary>>(
    queryKeys.productionShiftSummary(filters),
    (prev) => {
      if (!prev?.data) return prev;

      const totalRounds = prev.data.totalRounds + 1;
      const activeEmployees = round.employee
        ? Math.max(prev.data.activeEmployees, 1)
        : prev.data.activeEmployees;

      const hourlyTotals = [...prev.data.hourlyTotals];
      const hourIdx = hourlyTotals.findIndex((h) => h.hourLabel === round.shiftHourLabel);
      if (hourIdx >= 0) {
        hourlyTotals[hourIdx] = {
          ...hourlyTotals[hourIdx],
          rounds: hourlyTotals[hourIdx].rounds + 1,
        };
      } else {
        hourlyTotals.push({ hourLabel: round.shiftHourLabel, rounds: 1 });
        hourlyTotals.sort((a, b) => a.hourLabel.localeCompare(b.hourLabel));
      }

      let topPerformers = [...prev.data.topPerformers];
      if (round.employee) {
        const name = round.employee.employeeName;
        const existingIdx = topPerformers.findIndex(
          (p) => p.employeeName === name && p.machineId === round.machineId
        );
        if (existingIdx >= 0) {
          topPerformers[existingIdx] = {
            ...topPerformers[existingIdx],
            totalRounds: topPerformers[existingIdx].totalRounds + 1,
          };
        } else {
          topPerformers.push({
            employeeName: name,
            machineId: round.machineId,
            totalRounds: round.totalRoundsShift ?? 1,
          });
        }
        topPerformers.sort((a, b) => b.totalRounds - a.totalRounds);
        topPerformers = topPerformers.slice(0, 10);
      }

      return {
        ...prev,
        data: {
          ...prev.data,
          totalRounds,
          activeEmployees,
          avgRoundsPerEmployee: activeEmployees
            ? Math.round(totalRounds / activeEmployees)
            : 0,
          hourlyTotals,
          topPerformers,
        },
      };
    }
  );

  const recentRound: MachineRound = {
    _id: round.roundKey,
    roundKey: round.roundKey,
    epc: "",
    employeeName: round.employee?.employeeName ?? "Unregistered tag",
    employeeId: round.employee?.employeeId ?? "",
    machineId: round.machineId,
    readerId: "",
    department: (round.employee?.department ?? "Production") as MachineRound["department"],
    shift: round.shift,
    factoryDate: round.factoryDate,
    shiftHourLabel: round.shiftHourLabel,
    detectedAt: round.detectedAt,
    withinShift: true,
  };

  queryClient.setQueryData<ApiResponse<MachineRound[]> & { pagination?: unknown }>(
    queryKeys.recentRounds(),
    (prev) => {
      if (!prev?.data) return prev;
      const exists = prev.data.some((r) => r.roundKey === round.roundKey);
      if (exists) return prev;
      return {
        ...prev,
        data: [recentRound, ...prev.data].slice(0, 10),
      };
    }
  );
}
