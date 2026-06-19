import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../src/config/env.js", () => ({
  env: { factoryTimezone: "Asia/Kolkata" },
}));

import {
  getFactoryDate,
  getShiftBounds,
  isLateEntry,
} from "../../../src/utils/factoryDate.js";

describe("factoryDate", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe("getFactoryDate", () => {
    it("formats date in factory timezone", () => {
      const date = new Date("2026-06-17T18:30:00.000Z");
      expect(getFactoryDate(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getShiftBounds", () => {
    it("handles day shift within same calendar day", () => {
      const shift = { startTime: "09:00", endTime: "17:00" };
      const bounds = getShiftBounds(shift, new Date("2026-06-17T04:00:00.000Z"));

      expect(bounds.crossesMidnight).toBe(false);
      expect(bounds.endAt.getTime()).toBeGreaterThan(bounds.startAt.getTime());
    });

    it("handles night shift crossing midnight", () => {
      const shift = { startTime: "22:00", endTime: "06:00" };
      const bounds = getShiftBounds(shift, new Date("2026-06-17T18:00:00.000Z"));

      expect(bounds.crossesMidnight).toBe(true);
      expect(bounds.endAt.getTime()).toBeGreaterThan(bounds.startAt.getTime());
    });
  });

  describe("isLateEntry", () => {
    it("returns true when detected after shift start", () => {
      const shift = { startTime: "09:00", endTime: "17:00" };
      const { startAt } = getShiftBounds(shift, new Date("2026-06-17T04:00:00.000Z"));
      const late = new Date(startAt.getTime() + 60_000);

      expect(isLateEntry(late, shift)).toBe(true);
    });

    it("returns false when detected at shift start", () => {
      const shift = { startTime: "09:00", endTime: "17:00" };
      const { startAt } = getShiftBounds(shift, new Date("2026-06-17T04:00:00.000Z"));

      expect(isLateEntry(startAt, shift)).toBe(false);
    });
  });
});
