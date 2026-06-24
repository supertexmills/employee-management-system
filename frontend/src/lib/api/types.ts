import type { Department, Role, Shift } from "@/lib/constants";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  profilePicture: string | null;
}

export interface ProfileUser extends SessionUser {
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  employeeName: string;
  phoneNumber: string;
  department: Department;
  designation: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  joinedDate?: string;
  rfid: string;
  shift: Shift;
  isActive: boolean;
  profilePicture?: string | null;
  createdAt?: string;
}

export interface ReaderStatus {
  enabled?: boolean;
  readerId: string;
  connected: boolean;
  location?: string;
  lastSeenAt?: string | null;
}

export interface ProductionLiveMachine {
  machineId: string;
  name: string;
  readerConnected: boolean;
  lastRoundAt: string | null;
  roundsThisHour: number;
  totalRoundsShift: number;
  activeEmployees: number;
}

export interface ProductionLive {
  factoryDate: string;
  shift: Shift;
  currentShift: Shift;
  shiftWindow: { start: string; end: string; timezone: string } | null;
  machines: ProductionLiveMachine[];
  totals: { roundsThisHour: number; roundsTodayShift: number };
  updatedAt: string;
}

export interface ProductionSummary {
  factoryDate: string;
  shift: Shift | null;
  totalRounds: number;
  activeMachines: number;
  activeEmployees: number;
  avgRoundsPerEmployee: number;
  hourlyTotals: { hourLabel: string; rounds: number }[];
  topPerformers: {
    employeeName: string;
    machineId: string;
    totalRounds: number;
  }[];
}

export interface EmployeeMachineSummary {
  machineId: string;
  totalRounds: number;
  roundsThisHour: number;
  hourlyRounds: { hourIndex: number; hourLabel: string; rounds: number }[];
  targetRoundsPerShift: number | null;
  achievementPercent: number | null;
  lastRoundAt: string | null;
}

export interface EmployeeProductionSummary {
  employee: Employee;
  factoryDate: string;
  shift: Shift;
  machines: EmployeeMachineSummary[];
}

export interface MachineRound {
  _id: string;
  roundKey: string;
  epc: string;
  employee?: Employee | string;
  employeeName: string;
  employeeId: string;
  machineId: string;
  readerId: string;
  department: Department;
  shift: Shift;
  factoryDate: string;
  shiftHourLabel: string;
  detectedAt: string;
  withinShift: boolean;
}

export interface Machine {
  _id: string;
  machineId: string;
  name: string;
  department: Department;
  defaultShift: Shift;
  location: string;
  minRoundIntervalSeconds: number;
  targetRoundsPerShift: number;
  isActive: boolean;
  reader?: string | { readerId: string };
}

export interface ProductionReader {
  _id: string;
  readerId: string;
  type: "MACHINE" | "GATE";
  machine?: string | null;
  ip: string;
  port: number;
  location: string;
  isActive: boolean;
  lastSeenAt?: string | null;
}

export interface AdminListItem {
  id: string;
  _id: string;
  username: string;
  email: string;
  role: Role;
  status: "pending" | "active" | "inactive" | "suspended";
  isActive: boolean;
  profilePicture?: string | null;
  lastLoginAt?: string | null;
}

export interface Admin extends AdminListItem {}

export interface HealthStatus {
  success: boolean;
  status: string;
  timestamp: string;
  db: string;
  rfid: ReaderStatus;
  production: { machinesActive: number };
  env: string;
}
