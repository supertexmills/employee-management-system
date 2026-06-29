import RawTagEvent from "../../models/rfid/rawTagEvent.model.js";

/**
 * @param {import("./types/tagEvent.js").TagEvent} tagEvent
 */
export async function persistRawTagEvent(tagEvent) {
  return RawTagEvent.create({
    eventId: tagEvent.eventId,
    readerId: tagEvent.readerId,
    epc: tagEvent.epc,
    rssi: tagEvent.rssi,
    antennaId: tagEvent.antennaId,
    rawHex: tagEvent.rawHex,
    source: tagEvent.source,
    location: tagEvent.location,
    detectedAt: tagEvent.detectedAt,
    processed: "pending",
  });
}

export async function markCounted(eventId, roundKey) {
  await RawTagEvent.findOneAndUpdate(
    { eventId },
    { $set: { processed: "counted", roundKey, rejectedReason: null } }
  );
}

export async function markRejected(eventId, reason) {
  await RawTagEvent.findOneAndUpdate(
    { eventId },
    { $set: { processed: "rejected", rejectedReason: reason } }
  );
}
