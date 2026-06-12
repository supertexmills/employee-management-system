export const DEPARTMENTS = [
  "Production",
  "Quality",
  "Maintenance",
  "HR",
  "Accounts",
  "Store",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const SHIFTS = ["morning", "evening", "night"] as const;

export type Shift = (typeof SHIFTS)[number];

export const SHIFT_LABELS: Record<Shift, string> = {
  morning: "Morning",
  evening: "Evening",
  night: "Night",
};
