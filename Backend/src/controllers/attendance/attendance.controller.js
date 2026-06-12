import * as liveCountService from "../../services/attendance/liveCount.service.js";
import * as attendanceService from "../../services/attendance/attendance.service.js";

export const todaySummary = async (req, res, next) => {
  try {
    const summary = await liveCountService.getTodaySummary(req.user, req.validatedQuery);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

export const liveFloor = async (req, res, next) => {
  try {
    const result = await liveCountService.getLiveFloor(req.user, req.validatedQuery);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const employeeToday = async (req, res, next) => {
  try {
    const data = await attendanceService.getEmployeeToday(
      req.user,
      req.validatedParams.id
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const employeeHistory = async (req, res, next) => {
  try {
    const result = await attendanceService.getEmployeeHistory(
      req.user,
      req.validatedParams.id,
      req.validatedQuery
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
