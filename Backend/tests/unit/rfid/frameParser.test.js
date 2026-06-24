import { describe, it, expect, beforeEach } from "vitest";
import { FrameParser } from "../../../src/services/rfid/protocol/frameParser.js";
import { extractTagsFromHex } from "../../../src/services/rfid/protocol/epcExtractor.js";

const EPC_1 = "E28068940000402ED4B57CEC";
const EPC_2 = "E28068940000502ED4B58C55";

const FRAME_1 = Buffer.from(`AAAAFF06003000${EPC_1}`, "hex");
const FRAME_2 = Buffer.from(`AAAAFF06003000${EPC_2}`, "hex");
const COMBINED = Buffer.concat([FRAME_1, FRAME_2]);

function collectTags(parser, chunk) {
  const { frames } = parser.append(chunk);
  const tags = [];
  for (const frame of frames) {
    tags.push(...extractTagsFromHex(frame.toString("hex").toUpperCase()));
  }
  return tags;
}

describe("FrameParser", () => {
  /** @type {FrameParser} */
  let parser;

  beforeEach(() => {
    parser = new FrameParser();
  });

  it("parses a complete frame in one chunk", () => {
    const tags = collectTags(parser, FRAME_1);
    expect(tags).toHaveLength(1);
    expect(tags[0].epc).toBe(EPC_1);
  });

  it("parses two frames in one chunk", () => {
    const tags = collectTags(parser, COMBINED);
    expect(tags.map((t) => t.epc)).toEqual([EPC_1, EPC_2]);
  });

  it("reassembles a frame split across two chunks", () => {
    const splitAt = Math.floor(FRAME_1.length / 2);
    const part1 = FRAME_1.subarray(0, splitAt);
    const part2 = FRAME_1.subarray(splitAt);

    const tags1 = collectTags(parser, part1);
    expect(tags1).toHaveLength(0);

    const tags2 = collectTags(parser, part2);
    expect(tags2).toHaveLength(1);
    expect(tags2[0].epc).toBe(EPC_1);
  });

  it("reassembles a frame split across three chunks", () => {
    const third = Math.floor(FRAME_1.length / 3);
    const part1 = FRAME_1.subarray(0, third);
    const part2 = FRAME_1.subarray(third, third * 2);
    const part3 = FRAME_1.subarray(third * 2);

    expect(collectTags(parser, part1)).toHaveLength(0);
    expect(collectTags(parser, part2)).toHaveLength(0);

    const tags = collectTags(parser, part3);
    expect(tags).toHaveLength(1);
    expect(tags[0].epc).toBe(EPC_1);
  });

  it("reset clears internal buffer", () => {
    const splitAt = Math.floor(FRAME_1.length / 2);
    parser.append(FRAME_1.subarray(0, splitAt));
    parser.reset();

    const tags = collectTags(parser, FRAME_1);
    expect(tags).toHaveLength(1);
    expect(tags[0].epc).toBe(EPC_1);
  });
});
