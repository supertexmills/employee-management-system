import { apiRequest } from "./client";
import type { ApiResponse, Employee, Pagination } from "./types";

export async function listEmployees(params?: Record<string, string | number | boolean>) {
  return apiRequest<ApiResponse<Employee[]> & { pagination: Pagination }>(
    "/employees",
    { params }
  );
}

export async function getEmployee(id: string) {
  return apiRequest<ApiResponse<Employee>>(`/employees/${id}`);
}

export async function createEmployee(data: Record<string, unknown>) {
  return apiRequest<ApiResponse<Employee>>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id: string, data: Record<string, unknown>) {
  return apiRequest<ApiResponse<Employee>>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: string) {
  return apiRequest<ApiResponse<Employee>>(`/employees/${id}`, {
    method: "DELETE",
  });
}
