import { EventEmitter } from "events";

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

export function publishRfidEvent(payload) {
  eventBus.emit("rfid:event", payload);
}

export function publishAttendanceChanged() {
  eventBus.emit("attendance:changed");
}

/** @deprecated Prefer publishAttendanceChanged — SSE clients compute filtered summaries */
export function publishAttendanceSummary(_payload) {
  eventBus.emit("attendance:changed");
}

export function publishAttendanceRow(row) {
  eventBus.emit("attendance:row", row);
}

export function publishRoundEvent(payload) {
  eventBus.emit("production:round", payload);
}

export function publishProductionChanged() {
  eventBus.emit("production:changed");
}
