import { apiRequest } from "./client";
import type {
  ApiResponse,
  EmployeeProductionSummary,
  Machine,
  MachineRound,
  Pagination,
  ProductionLive,
  ProductionReader,
  ProductionSummary,
  ReaderStatus,
} from "./types";

export async function getProductionLive(params?: Record<string, string>) {
  return apiRequest<ApiResponse<ProductionLive>>("/v1/production/live", { params });
}

export async function getProductionTodaySummary(params?: Record<string, string>) {
  return apiRequest<ApiResponse<ProductionSummary>>("/v1/production/summary/today", {
    params,
  });
}

export async function getProductionShiftSummary(params?: Record<string, string>) {
  return apiRequest<ApiResponse<ProductionSummary>>("/v1/production/summary/shift", {
    params,
  });
}

export async function listRounds(params?: Record<string, string | number>) {
  return apiRequest<ApiResponse<MachineRound[]> & { pagination: Pagination }>(
    "/v1/production/rounds",
    { params }
  );
}

export async function getRound(roundKey: string) {
  return apiRequest<ApiResponse<MachineRound>>(
    `/v1/production/rounds/${encodeURIComponent(roundKey)}`
  );
}

export async function listMachines(params?: Record<string, string | number | boolean>) {
  return apiRequest<ApiResponse<Machine[]> & { pagination: Pagination }>(
    "/v1/production/machines",
    { params }
  );
}

export async function getMachine(machineId: string) {
  return apiRequest<ApiResponse<Machine>>(`/v1/production/machines/${machineId}`);
}

export async function createMachine(data: Record<string, unknown>) {
  return apiRequest<ApiResponse<Machine>>("/v1/production/machines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMachine(machineId: string, data: Record<string, unknown>) {
  return apiRequest<ApiResponse<Machine>>(`/v1/production/machines/${machineId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMachine(machineId: string) {
  return apiRequest<ApiResponse<Machine>>(`/v1/production/machines/${machineId}`, {
    method: "DELETE",
  });
}

export async function listReaders(params?: Record<string, string | number | boolean>) {
  return apiRequest<ApiResponse<ProductionReader[]> & { pagination: Pagination }>(
    "/v1/production/readers",
    { params }
  );
}

export async function getReadersStatus() {
  return apiRequest<ApiResponse<ReaderStatus[]>>("/v1/production/readers/status");
}

export async function createReader(data: Record<string, unknown>) {
  return apiRequest<ApiResponse<ProductionReader>>("/v1/production/readers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateReader(readerId: string, data: Record<string, unknown>) {
  return apiRequest<ApiResponse<ProductionReader>>(
    `/v1/production/readers/${readerId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export async function getEmployeeProductionSummary(id: string, params?: Record<string, string>) {
  return apiRequest<ApiResponse<EmployeeProductionSummary>>(
    `/v1/production/employees/${id}/summary`,
    { params }
  );
}

export async function getEmployeeRoundHistory(
  id: string,
  params?: Record<string, string | number>
) {
  return apiRequest<ApiResponse<MachineRound[]> & { pagination: Pagination }>(
    `/v1/production/employees/${id}/history`,
    { params }
  );
}

export async function getMachineSummary(machineId: string, params?: Record<string, string>) {
  return apiRequest<ApiResponse<ProductionSummary>>(
    `/v1/production/machines/${machineId}/summary`,
    { params }
  );
}
