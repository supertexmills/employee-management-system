import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  checkDebounce,
  commitDebounce,
  evaluateTagForRound,
  resetTagFilterState,
} from "../../../src/services/rfid/tagFilter.service.js";

describe("tagFilter", () => {
  beforeEach(() => {
    resetTagFilterState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts first read for epc+machine", () => {
    const result = evaluateTagForRound({
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_01",
      intervalSeconds: 30,
    });
    expect(result).toEqual({ accept: true, reason: null });
  });

  it("rejects repeat read within debounce interval", () => {
    const params = {
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_01",
      intervalSeconds: 30,
    };

    evaluateTagForRound(params);
    vi.advanceTimersByTime(5000);

    const result = evaluateTagForRound(params);
    expect(result).toEqual({ accept: false, reason: "debounce" });
  });

  it("accepts read after debounce interval elapsed", () => {
    const params = {
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_01",
      intervalSeconds: 30,
    };

    evaluateTagForRound(params);
    vi.advanceTimersByTime(31000);

    const result = evaluateTagForRound(params);
    expect(result).toEqual({ accept: true, reason: null });
  });

  it("checkDebounce does not advance timer until commitDebounce", () => {
    const params = {
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_01",
      intervalSeconds: 30,
    };

    expect(checkDebounce(params)).toEqual({ accept: true, reason: null });
    expect(checkDebounce(params)).toEqual({ accept: true, reason: null });

    commitDebounce({ epc: params.epc, machineId: params.machineId });
    vi.advanceTimersByTime(5000);

    expect(checkDebounce(params)).toEqual({ accept: false, reason: "debounce" });
  });

  it("tracks epc+machine independently", () => {
    evaluateTagForRound({
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_01",
      intervalSeconds: 30,
    });

    const otherMachine = evaluateTagForRound({
      epc: "E28068940000402ED4B57CEC",
      machineId: "MILL_02",
      intervalSeconds: 30,
    });

    expect(otherMachine).toEqual({ accept: true, reason: null });
  });
});
