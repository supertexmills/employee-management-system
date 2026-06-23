import { processRead } from "./roundCounter.service.js";

let ingestQueue = Promise.resolve();

async function ingestRound(epc, rawHex, readerId) {
  await processRead({ epc, readerId, rawHex, source: "TCP" });
}

export function enqueueRound(epc, rawHex, readerId) {
  ingestQueue = ingestQueue
    .then(() => ingestRound(epc, rawHex, readerId))
    .catch((error) => {
      console.error("Round ingest error:", error.message);
    });
}

export async function drainRoundQueue() {
  await ingestQueue;
}
