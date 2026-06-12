import * as rfidEventService from "../../services/rfid/rfidEvent.service.js";
import * as liveCountService from "../../services/attendance/liveCount.service.js";
import { eventBus } from "../../services/rfid/eventBus.js";
import { getReaderStatus } from "../../services/rfid/rfidReader.service.js";

export const listEvents = async (req, res, next) => {
  try {
    const result = await rfidEventService.listEvents(req.user, req.validatedQuery);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const streamEvents = async (req, res, next) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const send = (type, data) => {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const summary = await liveCountService.getLiveSummary();
    send("attendance:summary", summary);

    const readerStatus = getReaderStatus();
    send("reader:status", readerStatus);

    const onTag = (payload) => send("rfid:event", payload);
    const onSummary = (payload) => send("attendance:summary", payload);

    eventBus.on("rfid:event", onTag);
    eventBus.on("attendance:summary", onSummary);

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000);

    req.on("close", () => {
      clearInterval(heartbeat);
      eventBus.off("rfid:event", onTag);
      eventBus.off("attendance:summary", onSummary);
    });
  } catch (err) {
    next(err);
  }
};

export const listUnknownTags = async (req, res, next) => {
  try {
    const data = await rfidEventService.listUnknownTags(req.user, req.validatedQuery);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const readerStatus = async (_req, res, next) => {
  try {
    res.json({ success: true, data: getReaderStatus() });
  } catch (err) {
    next(err);
  }
};
