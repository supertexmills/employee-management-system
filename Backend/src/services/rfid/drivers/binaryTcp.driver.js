import net from "net";
import { C8_SINGLE_TAG } from "../protocol/commands.js";
import { FrameParser } from "../protocol/frameParser.js";
import { extractTagsFromHex } from "../protocol/epcExtractor.js";
import { createTagEvent } from "../types/tagEvent.js";

/**
 * @typedef {Object} BinaryTcpReaderConfig
 * @property {string} readerId
 * @property {string} ip
 * @property {number} port
 * @property {string} location
 * @property {number} pollIntervalMs
 */

/**
 * @param {BinaryTcpReaderConfig} config
 * @param {(tagEvent: import("../types/tagEvent.js").TagEvent) => void} onTag
 */
export function createBinaryTcpDriver(config, onTag) {
  let socket = null;
  let pollInterval = null;
  let reconnectTimeout = null;
  let reconnectAttempt = 0;
  let connected = false;
  let lastSeenAt = null;
  let tagsReceived = 0;
  let parseErrors = 0;
  let lastError = null;
  const frameParser = new FrameParser();

  function clearPollInterval() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function scheduleReconnect(connectFn) {
    if (reconnectTimeout) return;

    const delay = Math.min(30000, 1000 * 2 ** reconnectAttempt);
    reconnectAttempt += 1;

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectFn();
    }, delay);
  }

  function handleData(buffer) {
    lastSeenAt = new Date();

    try {
      const { frames } = frameParser.append(buffer);

      for (const frame of frames) {
        const rawHex = frame.toString("hex").toUpperCase();
        const tags = extractTagsFromHex(rawHex);

        for (const tag of tags) {
          tagsReceived += 1;
          const tagEvent = createTagEvent({
            readerId: config.readerId,
            epc: tag.epc,
            rawHex,
            source: "TCP",
            location: config.location,
            rssi: tag.rssi,
            antennaId: tag.antennaId,
            detectedAt: new Date(),
          });
          onTag(tagEvent);
        }
      }
    } catch (err) {
      parseErrors += 1;
      lastError = err.message;
      console.error("RFID parse error:", { readerId: config.readerId, error: err.message });
    }
  }

  function connect() {
    if (socket) {
      socket.removeAllListeners();
      socket.destroy();
      socket = null;
    }

    clearPollInterval();
    frameParser.reset();

    const newSocket = new net.Socket();
    socket = newSocket;

    newSocket.connect(config.port, config.ip, () => {
      connected = true;
      reconnectAttempt = 0;
      lastSeenAt = new Date();
      lastError = null;
      console.log("RFID reader connected", {
        readerId: config.readerId,
        ip: config.ip,
        port: config.port,
        pollMs: config.pollIntervalMs,
      });

      pollInterval = setInterval(() => {
        if (!newSocket.destroyed) {
          newSocket.write(C8_SINGLE_TAG);
        }
      }, config.pollIntervalMs);
    });

    newSocket.on("data", handleData);

    newSocket.on("error", (err) => {
      lastError = err.message;
      console.log("RFID error:", { readerId: config.readerId, error: err.message });
      connected = false;
    });

    newSocket.on("close", () => {
      console.log("RFID reader disconnected", { readerId: config.readerId });
      connected = false;
      clearPollInterval();
      scheduleReconnect(connect);
    });
  }

  return {
    start() {
      connect();
    },
    stop() {
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
      frameParser.reset();
    },
    getStatus() {
      return {
        readerId: config.readerId,
        location: config.location,
        connected,
        lastSeenAt,
        tagsReceived,
        parseErrors,
        lastError,
        ip: config.ip,
        port: config.port,
      };
    },
  };
}
