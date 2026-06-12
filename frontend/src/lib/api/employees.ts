import type { Department, Shift } from "@/lib/constants/departments";
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee";
import { apiListRequest, apiRequest } from "./client";

export type ListEmployeesParams = {
  page?: number;
  limit?: number;
  department?: Department;
  shift?: Shift;
  isActive?: boolean;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const employeesApi = {
  list: (params: ListEmployeesParams = {}) =>
    apiListRequest<Employee>(
      `/api/employees${buildQuery(params as Record<string, string | number | boolean | undefined>)}`,
    ),

  getById: (id: string) => apiRequest<Employee>(`/api/employees/${id}`),

  create: (payload: CreateEmployeePayload) =>
    apiRequest<Employee>("/api/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdateEmployeePayload) =>
    apiRequest<Employee>(`/api/employees/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiRequest<{ message: string }>(`/api/employees/${id}`, {
      method: "DELETE",
    }),
};
