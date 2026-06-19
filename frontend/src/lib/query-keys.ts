export const queryKeys = {
  admins: (page?: number, search?: string) =>
    ["admins", page ?? 1, search ?? ""] as const,
  employees: (page?: number, search?: string, department?: string) =>
    ["employees", page ?? 1, search ?? "", department ?? ""] as const,
  employee: (id: string) => ["employee", id] as const,
  health: () => ["health"] as const,
  attendanceSummary: (filters?: Record<string, string>) =>
    ["attendance-summary", filters ?? {}] as const,
  attendanceLive: (filters?: Record<string, string>) =>
    ["attendance-live", filters ?? {}] as const,
  productionLive: (filters?: Record<string, string>) =>
    ["production-live", filters ?? {}] as const,
  productionShiftSummary: (filters?: Record<string, string>) =>
    ["production-shift-summary", filters ?? {}] as const,
  productionTodaySummary: (filters?: Record<string, string>) =>
    ["production-summary", filters ?? {}] as const,
  machines: () => ["machines"] as const,
  productionReaders: () => ["production-readers"] as const,
  readersStatus: () => ["readers-status"] as const,
  rounds: (page?: number) => ["production-rounds", page ?? 1] as const,
  rfidEvents: (params?: Record<string, string | number>) =>
    ["rfid-events", params ?? {}] as const,
  recentRfid: () => ["recent-rfid"] as const,
  unknownTags: (limit?: number) => ["unknown-tags-count", limit ?? 1] as const,
};
