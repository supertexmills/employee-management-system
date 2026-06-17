import type { Department, Shift } from "@/lib/constants/departments";
import type { Employee } from "@/types/employee";
import type { ReaderStatus } from "@/types/attendance";

export type ShiftWindow = {
  start: string;
  end: string;
  timezone: string;
};

export type MachineLiveStat = {
  machineId: string;
  name: string;
  readerConnected: boolean;
  lastRoundAt: string | null;
  roundsThisHour: number;
  totalRoundsShift: number;
  activeEmployees: number;
};

export type ProductionLiveSnapshot = {
  factoryDate: string;
  shift: string;
  shiftWindow: ShiftWindow | null;
  machines: MachineLiveStat[];
  totals: {
    roundsThisHour: number;
    roundsTodayShift: number;
  };
  updatedAt: string;
};

export type HourlyTotal = {
  hourLabel: string;
  rounds: number;
};

export type TopPerformer = {
  employeeName: string;
  machineId: string;
  totalRounds: number;
};

export type ProductionTodaySummary = {
  factoryDate: string;
  shift: string | null;
  totalRounds: number;
  activeMachines: number;
  activeEmployees: number;
  avgRoundsPerEmployee: number;
  hourlyTotals: HourlyTotal[];
  topPerformers: TopPerformer[];
};

export type ProductionRoundEmployee = Pick<
  Employee,
  "employeeId" | "employeeName" | "department" | "shift"
> & { _id: string };

export type ProductionRoundEvent = {
  roundKey: string;
  machineId: string;
  machineName?: string;
  employee: ProductionRoundEmployee | null;
  shiftHourLabel: string;
  shiftHourIndex: number;
  roundsThisHour: number | null;
  totalRoundsShift: number | null;
  detectedAt: string;
  factoryDate: string;
  shift: Shift;
};

export type MachineRound = {
  _id: string;
  roundKey: string;
  epc: string;
  employee: string | null;
  employeeName: string;
  employeeId: string | null;
  machine: string;
  machineId: string;
  readerId: string;
  department: Department | null;
  shift: Shift;
  factoryDate: string;
  shiftHourIndex: number;
  shiftHourLabel: string;
  detectedAt: string;
  withinShift: boolean;
  source: string;
};

export type HourlyRoundSlot = {
  hourIndex: number;
  hourLabel: string;
  rounds: number;
};

export type MachineShiftSummary = {
  _id: string;
  employee: string;
  employeeName: string;
  employeeId: string;
  machine: string;
  machineId: string;
  department: Department;
  shift: Shift;
  factoryDate: string;
  shiftStartAt: string;
  shiftEndAt: string;
  totalRounds: number;
  hourlyRounds: HourlyRoundSlot[];
  roundsThisHour: number;
  currentHourIndex: number;
  lastRoundAt: string | null;
  targetRoundsPerShift: number | null;
  achievementPercent: number | null;
};

export type Machine = {
  _id: string;
  machineId: string;
  name: string;
  department: Department;
  defaultShift: Shift;
  reader: {
    _id: string;
    readerId: string;
    ip: string;
    port: number;
    location: string;
    type: string;
    isActive: boolean;
  } | null;
  location: string;
  minRoundIntervalSeconds: number;
  targetRoundsPerShift: number | null;
  isActive: boolean;
};

export type ProductionReaderStatus = ReaderStatus & {
  type?: string;
  machineId?: string | null;
  ip?: string;
  port?: number;
};

export type MachineSummaryResponse = {
  machine: Machine;
  summaries: MachineShiftSummary[];
};

export type ProductionFilters = {
  department?: Department;
  shift?: Shift;
  machineId?: string;
  factoryDate?: string;
};
