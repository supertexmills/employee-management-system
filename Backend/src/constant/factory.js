export const DEPARTMENTS = [
  "Production",
  "Quality",
  "Maintenance",
  "HR",
  "Accounts",
  "Store",
];

export const SHIFTS = ["morning", "evening", "night"];

export const READER_TYPES = ["MACHINE", "GATE"];

export const READER_PROTOCOLS = ["BINARY_TCP"];

export const ROUND_SOURCES = ["TCP", "HTTP_INGEST", "MQTT"];

export const TAG_REJECT_REASONS = [
  "unknown_reader",
  "no_machine",
  "debounce",
  "outside_shift",
  "duplicate",
];

export const TAG_PROCESSED_STATES = ["pending", "counted", "rejected"];
