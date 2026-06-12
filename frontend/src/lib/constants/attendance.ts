import type { AttendanceStatus } from "@/types/attendance";

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  INSIDE: "Inside",
  EXITED: "Exited",
  LATE: "Late",
  OVERTIME: "Overtime",
  MISSING_TAG: "Missing Tag",
  UNAUTHORIZED: "Unauthorized",
};

type StatusTone = "success" | "warning" | "error" | "neutral" | "info";

export function attendanceStatusTone(status: AttendanceStatus): StatusTone {
  switch (status) {
    case "PRESENT":
    case "INSIDE":
      return "success";
    case "LATE":
    case "OVERTIME":
    case "MISSING_TAG":
      return "warning";
    case "ABSENT":
    case "UNAUTHORIZED":
      return "error";
    case "EXITED":
      return "neutral";
    default:
      return "info";
  }
}
