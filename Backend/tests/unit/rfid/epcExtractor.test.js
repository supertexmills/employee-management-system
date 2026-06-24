import { describe, it, expect } from "vitest";
import {
  extractTagsFromFrame,
  extractTagsFromHex,
} from "../../../src/services/rfid/protocol/epcExtractor.js";

const EPC_1 = "E28068940000402ED4B57CEC";
const EPC_2 = "E28068940000502ED4B58C55";

describe("epcExtractor", () => {
  describe("extractTagsFromFrame", () => {
    it("extracts EPC from a single frame", () => {
      const frame = `AAAAFF06003000${EPC_1}`;
      const tags = extractTagsFromFrame(frame);
      expect(tags).toHaveLength(1);
      expect(tags[0].epc).toBe(EPC_1);
      expect(tags[0].rssi).toBeNull();
      expect(tags[0].antennaId).toBeNull();
    });

    it("returns empty array when no EPC match", () => {
      expect(extractTagsFromFrame("AAAAFF05C8003A5E")).toEqual([]);
    });
  });

  describe("extractTagsFromHex", () => {
    it("extracts multiple EPCs from combined frames", () => {
      const hex = `AAAAFF06003000${EPC_1}AAAAFF06003000${EPC_2}`;
      const tags = extractTagsFromHex(hex);
      expect(tags.map((t) => t.epc)).toEqual([EPC_1, EPC_2]);
    });

    it("is case-insensitive", () => {
      const hex = `aaaaff06003000${EPC_1.toLowerCase()}`;
      const tags = extractTagsFromHex(hex);
      expect(tags[0].epc).toBe(EPC_1);
    });
  });
});
