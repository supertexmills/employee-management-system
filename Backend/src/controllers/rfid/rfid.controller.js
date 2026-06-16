import * as rfidEventService from "../../services/rfid/rfidEvent.service.js";
import * as liveCountService from "../../services/attendance/liveCount.service.js";
import { eventBus } from "../../services/rfid/eventBus.js";
import { getReaderStatus } from "../../services/rfid/rfidReader.service.js";

function matchesFilters(record, filters) {
  if (filters.department && record.department !== filters.department) {
    return false;
  }
  if (filters.shift && record.shift !== filters.shift) {
    return false;
  }
  return true;
}

function matchesRfidEventFilters(event, filters) {
  const employee = event.employee;
  if (!employee || typeof employee !== "object") {
    return !filters.department && !filters.shift;
  }
  return matchesFilters(employee, filters);
}

function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}

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

    const filters = {
      department: req.validatedQuery?.department,
      shift: req.validatedQuery?.shift,
    };

    const send = (type, data) => {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const pushSummary = async () => {
      const summary = await liveCountService.getLiveSummary(filters);
      send("attendance:summary", summary);
    };

    const debouncedPushSummary = debounce(() => {
      void pushSummary().catch((err) => {
        console.error("SSE summary push failed:", err.message);
      });
    }, 200);

    await pushSummary();

    const readerStatus = getReaderStatus();
    send("reader:status", readerStatus);

    const onTag = (payload) => {
      if (!matchesRfidEventFilters(payload, filters)) return;
      send("rfid:event", payload);
    };

    const onRow = (row) => {
      if (!matchesFilters(row, filters)) return;
      send("attendance:row", row);
    };

    const onChanged = () => debouncedPushSummary();

    eventBus.on("rfid:event", onTag);
    eventBus.on("attendance:row", onRow);
    eventBus.on("attendance:changed", onChanged);

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000);

    const readerHeartbeat = setInterval(() => {
      send("reader:status", getReaderStatus());
    }, 10000);

    req.on("close", () => {
      clearInterval(heartbeat);
      clearInterval(readerHeartbeat);
      eventBus.off("rfid:event", onTag);
      eventBus.off("attendance:row", onRow);
      eventBus.off("attendance:changed", onChanged);
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
