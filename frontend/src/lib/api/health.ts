import { apiRequest } from "./client";
import type { HealthStatus } from "./types";

export async function getHealth() {
  return apiRequest<HealthStatus>("/health");
}
