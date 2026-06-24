import { processRead } from "./roundCounter.service.js";
import { createTagEvent } from "../rfid/types/tagEvent.js";
import { persistRawTagEvent } from "../rfid/tagEvent.service.js";

let ingestQueue = Promise.resolve();

/**
 * @param {import("../rfid/types/tagEvent.js").TagEvent} tagEvent
 */
async function ingestTagEvent(tagEvent) {
  await persistRawTagEvent(tagEvent);
  await processRead({
    epc: tagEvent.epc,
    readerId: tagEvent.readerId,
    rawHex: tagEvent.rawHex,
    source: tagEvent.source,
    eventId: tagEvent.eventId,
  });
}

/**
 * @param {import("../rfid/types/tagEvent.js").TagEvent} tagEvent
 */
export function enqueueTagEvent(tagEvent) {
  ingestQueue = ingestQueue
    .then(() => ingestTagEvent(tagEvent))
    .catch((error) => {
      console.error("Round ingest error:", error.message);
    });
}

export function enqueueRound(epc, rawHex, readerId, location = null) {
  const tagEvent = createTagEvent({
    readerId,
    epc,
    rawHex,
    source: "TCP",
    location,
  });
  enqueueTagEvent(tagEvent);
}

export async function drainRoundQueue() {
  await ingestQueue;
}
