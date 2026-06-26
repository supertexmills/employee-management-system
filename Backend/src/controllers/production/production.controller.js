import * as roundSummaryService from "../../services/production/roundSummary.service.js";
import * as machineService from "../../services/production/machine.service.js";
import * as readerService from "../../services/production/reader.service.js";
import { eventBus } from "../../services/rfid/eventBus.js";
import { getReaderStatus } from "../../services/rfid/rfidReader.service.js";
import { logger } from "../../config/logger.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

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

function matchesProductionFilters(payload, filters) {
  if (filters.machineId && payload.machineId !== filters.machineId) return false;
  if (filters.department && payload.employee?.department !== filters.department) {
    return false;
  }
  if (filters.shift && payload.shift !== filters.shift) return false;
  return true;
}

export const live = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getLiveSnapshot(req.validatedQuery);
  res.json({ success: true, data });
});

export const stream = asyncHandler(async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const filters = {
    department: req.validatedQuery?.department,
    shift: req.validatedQuery?.shift,
    machineId: req.validatedQuery?.machineId,
  };

  const send = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const pushLive = async () => {
    const data = await roundSummaryService.getLiveSnapshot(filters);
    send("production:live", data);
  };

  const debouncedPushLive = debounce(() => {
    void pushLive().catch((err) => {
      logger.error({ err: err.message, requestId: req.id }, "sse_production_live_push_failed");
    });
  }, 200);

  await pushLive();
  send("reader:status", getReaderStatus());

  const onRound = (payload) => {
    if (!matchesProductionFilters(payload, filters)) return;
    send("production:round", payload);
  };

  const onChanged = () => debouncedPushLive();

  eventBus.on("production:round", onRound);
  eventBus.on("production:changed", onChanged);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  const readerHeartbeat = setInterval(() => {
    send("reader:status", getReaderStatus());
  }, 10000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clearInterval(readerHeartbeat);
    eventBus.off("production:round", onRound);
    eventBus.off("production:changed", onChanged);
  });
});

export const listRounds = asyncHandler(async (req, res) => {
  const result = await roundSummaryService.listRounds(req.user, req.validatedQuery);
  res.json({ success: true, ...result });
});

export const getRound = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getRoundByKey(
    req.user,
    req.validatedParams.roundKey,
  );
  res.json({ success: true, data });
});

export const todaySummary = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getTodaySummary(req.user, req.validatedQuery);
  res.json({ success: true, data });
});

export const shiftSummary = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getShiftSummary(req.user, req.validatedQuery);
  res.json({ success: true, data });
});

export const listMachines = asyncHandler(async (req, res) => {
  const result = await machineService.listMachines(req.user, req.validatedQuery);
  res.json({ success: true, ...result });
});

export const createMachine = asyncHandler(async (req, res) => {
  const data = await machineService.createMachine(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const getMachine = asyncHandler(async (req, res) => {
  const data = await machineService.getMachine(req.user, req.validatedParams.machineId);
  res.json({ success: true, data });
});

export const updateMachine = asyncHandler(async (req, res) => {
  const data = await machineService.updateMachine(
    req.user,
    req.validatedParams.machineId,
    req.body,
  );
  res.json({ success: true, data });
});

export const deleteMachine = asyncHandler(async (req, res) => {
  const data = await machineService.deactivateMachine(
    req.user,
    req.validatedParams.machineId,
  );
  res.json({ success: true, data });
});

export const machineSummary = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getMachineSummary(
    req.user,
    req.validatedParams.machineId,
    req.validatedQuery,
  );
  res.json({ success: true, data });
});

export const listReaders = asyncHandler(async (req, res) => {
  const result = await readerService.listReaders(req.user, req.validatedQuery);
  res.json({ success: true, ...result });
});

export const readersStatus = asyncHandler(async (req, res) => {
  const data = await readerService.getReadersStatus(req.user);
  res.json({ success: true, data });
});

export const createReader = asyncHandler(async (req, res) => {
  const data = await readerService.createReader(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const updateReader = asyncHandler(async (req, res) => {
  const data = await readerService.updateReader(
    req.user,
    req.validatedParams.readerId,
    req.body,
  );
  res.json({ success: true, data });
});

export const employeeSummary = asyncHandler(async (req, res) => {
  const data = await roundSummaryService.getEmployeeSummary(
    req.user,
    req.validatedParams.id,
    req.validatedQuery,
  );
  res.json({ success: true, data });
});

export const employeeHistory = asyncHandler(async (req, res) => {
  const result = await roundSummaryService.getEmployeeHistory(
    req.user,
    req.validatedParams.id,
    req.validatedQuery,
  );
  res.json({ success: true, ...result });
});
