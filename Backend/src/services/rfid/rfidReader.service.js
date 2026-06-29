import * as readerManager from "./readerManager.service.js";

export function startRfidReader() {
  void readerManager.start();
}

export async function stopRfidReader() {
  await readerManager.stop();
}

export function getReaderStatus() {
  return readerManager.getPrimaryStatus();
}
