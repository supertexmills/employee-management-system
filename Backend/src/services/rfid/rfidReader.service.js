import net from "net";
import { env } from "../../config/env.js";
import { enqueueSave, drainSaveQueue } from "./rfidEvent.service.js";

const C8_SINGLE_TAG = Buffer.from("AAAAFF05C8003A5E", "hex");

let socket = null;
let pollInterval = null;
let reconnectTimeout = null;
let reconnectAttempt = 0;
let connected = false;
let lastSeenAt = null;

const readerState = {
  readerId: env.rfidReaderId,
  location: env.rfidLocation,
};

export function getReaderStatus() {
  return {
    enabled: env.rfidEnabled,
    connected,
    readerId: readerState.readerId,
    location: readerState.location,
    lastSeenAt,
  };
}

function extractEpcs(rawHex) {
  const epcs = [];
  const frames = rawHex.split("AAAA").filter(Boolean);

  for (const frame of frames) {
    const fullFrame = "AAAA" + frame;
    const match = fullFrame.match(/3000(E280[0-9A-F]{20})/i);
    if (match) epcs.push(match[1].toUpperCase());
  }

  return epcs;
}

function clearPollInterval() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function scheduleReconnect() {
  if (!env.rfidEnabled) return;
  if (reconnectTimeout) return;

  const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt);
  reconnectAttempt += 1;

  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connectReader();
  }, delay);
}

function connectReader() {
  if (!env.rfidEnabled) return;

  if (socket) {
    socket.removeAllListeners();
    socket.destroy();
    socket = null;
  }

  clearPollInterval();

  const newSocket = new net.Socket();
  socket = newSocket;

  newSocket.connect(env.rfidReaderPort, env.rfidReaderIp, () => {
    connected = true;
    reconnectAttempt = 0;
    lastSeenAt = new Date();
    console.log(
      `RFID Reader connected ${env.rfidReaderIp}:${env.rfidReaderPort} (poll ${env.rfidReaderPollMs}ms)`
    );

    pollInterval = setInterval(() => {
      if (!newSocket.destroyed) {
        newSocket.write(C8_SINGLE_TAG);
      }
    }, env.rfidReaderPollMs);
  });

  newSocket.on("data", (buffer) => {
    lastSeenAt = new Date();
    const rawHex = buffer.toString("hex").toUpperCase();
    const epcs = extractEpcs(rawHex);
    if (!epcs.length) return;

    for (const epc of epcs) {
      enqueueSave(epc, rawHex, readerState.readerId, readerState.location);
    }
  });

  newSocket.on("error", (err) => {
    console.log("RFID error:", err.message);
    connected = false;
  });

  newSocket.on("close", () => {
    console.log("RFID reader disconnected");
    connected = false;
    clearPollInterval();
    scheduleReconnect();
  });
}

export function startRfidReader() {
  if (!env.rfidEnabled) {
    console.log("RFID reader disabled (RFID_ENABLED=false)");
    return;
  }
  connectReader();
}

export async function stopRfidReader() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  clearPollInterval();

  if (socket) {
    socket.removeAllListeners();
    socket.destroy();
    socket = null;
  }

  connected = false;
  await drainSaveQueue();
}
