import { EventEmitter } from "events";

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

export function publishRfidEvent(payload) {
  eventBus.emit("rfid:event", payload);
}

export function publishAttendanceSummary(payload) {
  eventBus.emit("attendance:summary", payload);
}
