import { apiRequest } from "./client";
import type { ApiResponse, Pagination, ReaderStatus, RfidEvent } from "./types";

export async function listRfidEvents(params?: Record<string, string | number>) {
  return apiRequest<ApiResponse<RfidEvent[]> & { pagination: Pagination }>(
    "/rfid/events",
    { params }
  );
}

export async function listUnknownTags(params?: Record<string, string | number>) {
  return apiRequest<ApiResponse<{ epc: string; lastSeenAt: string; count: number }[]> & {
    pagination: Pagination;
  }>("/rfid/unknown-tags", { params });
}

export async function getReaderStatus() {
  return apiRequest<ApiResponse<ReaderStatus>>("/rfid/readers/status");
}
