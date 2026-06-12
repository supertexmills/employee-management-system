import type { Department, Shift } from "@/lib/constants/departments";
import type { Employee } from "@/types/employee";

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "INSIDE",
  "EXITED",
  "LATE",
  "OVERTIME",
  "MISSING_TAG",
  "UNAUTHORIZED",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type LiveSummary = {
  date: string;
  totalActive: number;
  insideNow: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overtimeNow: number;
  exitedToday: number;
  updatedAt: string;
};

export type AttendanceDayRow = {
  _id: string;
  employee: Pick<
    Employee,
    "employeeId" | "employeeName" | "department" | "shift" | "rfid" | "profilePicture"
  > & { _id: string };
  date: string;
  department: Department;
  shift: Shift;
  status: AttendanceStatus;
  firstEntryAt: string | null;
  lastExitAt: string | null;
  currentState: "OUTSIDE" | "INSIDE" | "EXITED";
  isLate: boolean;
  isOvertime: boolean;
  flags: string[];
};

export type RfidEventEmployee = Pick<
  Employee,
  "employeeId" | "employeeName" | "department" | "shift" | "rfid"
> & { _id: string };

export type RfidEvent = {
  _id: string;
  epc: string;
  employee: string | RfidEventEmployee | null;
  employeeName: string;
  action: "ENTRY" | "EXIT" | "UNKNOWN";
  readerId: string;
  location: string;
  detectedAt: string;
};

export function getRfidEventEmployee(
  event: RfidEvent,
): RfidEventEmployee | null {
  if (!event.employee || typeof event.employee === "string") return null;
  return event.employee;
}

export type ReaderStatus = {
  enabled: boolean;
  connected: boolean;
  readerId: string;
  location: string;
  lastSeenAt: string | null;
};
