import { randomUUID } from "crypto";

/**
 * @typedef {Object} TagEvent
 * @property {string} eventId
 * @property {string} readerId
 * @property {string} epc
 * @property {number|null} rssi
 * @property {number|null} antennaId
 * @property {string} rawHex
 * @property {string} source
 * @property {string|null} location
 * @property {Date} detectedAt
 */

/**
 * @param {Object} params
 * @param {string} params.readerId
 * @property {string} params.epc
 * @param {string} [params.rawHex]
 * @param {string} [params.source]
 * @param {string|null} [params.location]
 * @param {number|null} [params.rssi]
 * @param {number|null} [params.antennaId]
 * @param {Date} [params.detectedAt]
 * @param {string} [params.eventId]
 * @returns {TagEvent}
 */
export function createTagEvent({
  readerId,
  epc,
  rawHex = "",
  source = "TCP",
  location = null,
  rssi = null,
  antennaId = null,
  detectedAt = new Date(),
  eventId = randomUUID(),
}) {
  return {
    eventId,
    readerId,
    epc: epc.toUpperCase(),
    rssi,
    antennaId,
    rawHex,
    source,
    location,
    detectedAt,
  };
}
