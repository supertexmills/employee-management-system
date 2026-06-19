import { apiRequest } from "./client";
import type { ApiResponse, AttendanceDay, AttendanceSummary, Pagination } from "./types";

export async function getTodaySummary(params?: Record<string, string>) {
  return apiRequest<ApiResponse<AttendanceSummary>>("/attendance/summary/today", {
    params,
  });
}

export async function getLiveFloor(params?: Record<string, string | number>) {
  return apiRequest<ApiResponse<AttendanceDay[]> & { pagination: Pagination }>(
    "/attendance/live",
    { params }
  );
}

export async function getEmployeeToday(id: string) {
  return apiRequest<ApiResponse<AttendanceDay>>(`/attendance/employees/${id}/today`);
}

export async function getEmployeeHistory(
  id: string,
  params?: Record<string, string | number>
) {
  return apiRequest<ApiResponse<AttendanceDay[]> & { pagination: Pagination }>(
    `/attendance/employees/${id}/history`,
    { params }
  );
}
