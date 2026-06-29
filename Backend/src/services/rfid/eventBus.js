import { EventEmitter } from "events";

export const eventBus = new EventEmitter();
eventBus.setMaxListeners(100);

export function publishRoundEvent(payload) {
  eventBus.emit("production:round", payload);
}

export function publishProductionChanged() {
  eventBus.emit("production:changed");
}
