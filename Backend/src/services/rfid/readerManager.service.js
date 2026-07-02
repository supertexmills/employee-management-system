import Reader from "../../models/production/reader.model.js";
import { getSettings } from "../admin/factorySettings.service.js";
import { createBinaryTcpDriver } from "./drivers/binaryTcp.driver.js";
import { enqueueTagEvent, drainRoundQueue } from "../production/roundIngest.service.js";

/** @type {Map<string, ReturnType<createBinaryTcpDriver>>} */
const drivers = new Map();

let primaryReaderId = null;

async function loadReaderConfigs() {
  const readers = await Reader.find({ isActive: true }).lean();

  if (readers.length === 0) {
    console.warn("RFID enabled but no active readers found in DB — add a reader via the admin dashboard");
    return [];
  }

  return readers
    .filter((r) => (r.protocol ?? "BINARY_TCP") === "BINARY_TCP")
    .map((r) => ({
      readerId: r.readerId,
      ip: r.ip,
      port: r.port,
      location: r.location,
      pollIntervalMs: r.pollIntervalMs ?? 500,
      protocol: r.protocol ?? "BINARY_TCP",
    }));
}

function onTagReceived(tagEvent) {
  console.log("RFID tag received", {
    readerId: tagEvent.readerId,
    epc: tagEvent.epc,
    action: "tag_received",
  });
  enqueueTagEvent(tagEvent);
}

export async function start() {
  const { rfidEnabled } = getSettings();

  if (!rfidEnabled) {
    console.log("RFID reader disabled (rfidEnabled=false in FactorySettings)");
    return;
  }

  await stop();

  const configs = await loadReaderConfigs();
  if (configs.length === 0) {
    return;
  }

  primaryReaderId = configs[0].readerId;

  for (const config of configs) {
    const driver = createBinaryTcpDriver(config, onTagReceived);
    drivers.set(config.readerId, driver);
    driver.start();
  }

  console.log("RFID reader manager started", {
    action: "manager_start",
    readerCount: drivers.size,
    readerIds: [...drivers.keys()],
  });
}

export async function stop() {
  for (const driver of drivers.values()) {
    driver.stop();
  }
  drivers.clear();
  primaryReaderId = null;
  await drainRoundQueue();
}

export function getAllStatus() {
  const statuses = {};
  for (const [readerId, driver] of drivers) {
    statuses[readerId] = driver.getStatus();
  }
  return statuses;
}

export function getPrimaryStatus() {
  const primary = primaryReaderId ? drivers.get(primaryReaderId) : null;
  const status = primary?.getStatus();
  const { rfidEnabled } = getSettings();

  return {
    enabled: rfidEnabled,
    connected: status?.connected ?? false,
    readerId: status?.readerId ?? null,
    location: status?.location ?? null,
    lastSeenAt: status?.lastSeenAt ?? null,
    tagsReceived: status?.tagsReceived ?? 0,
    parseErrors: status?.parseErrors ?? 0,
    lastError: status?.lastError ?? null,
    readerCount: drivers.size,
  };
}
