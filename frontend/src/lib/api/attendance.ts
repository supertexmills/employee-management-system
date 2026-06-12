import type { Department, Shift } from "@/lib/constants/departments";
import type { AttendanceDayRow, AttendanceStatus, LiveSummary } from "@/types/attendance";
import { apiListRequest, apiRequest } from "./client";

export type LiveSummaryParams = {
  department?: Department;
  shift?: Shift;
};

export type LiveFloorParams = LiveSummaryParams & {
  page?: number;
  limit?: number;
  status?: AttendanceStatus;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const attendanceApi = {
  todaySummary: (params: LiveSummaryParams = {}) =>
    apiRequest<LiveSummary>(
      `/api/attendance/summary/today${buildQuery(params as Record<string, string | undefined>)}`,
    ),

  liveFloor: (params: LiveFloorParams = {}) =>
    apiListRequest<AttendanceDayRow>(
      `/api/attendance/live${buildQuery(params as Record<string, string | number | undefined>)}`,
    ),
};
