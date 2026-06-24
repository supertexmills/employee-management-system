import { extractTagsFromHex } from "./epcExtractor.js";

const FRAME_MARKER = Buffer.from([0xaa, 0xaa]);

function isCompleteFrame(buffer) {
  if (buffer.length < 4) return false;
  if (buffer[0] !== 0xaa || buffer[1] !== 0xaa) return false;
  const tags = extractTagsFromHex(buffer.toString("hex").toUpperCase());
  return tags.length > 0;
}

/**
 * Stateful TCP frame reassembler for AAAA-prefixed binary RFID reader protocol.
 */
export class FrameParser {
  constructor() {
    this._buffer = Buffer.alloc(0);
  }

  /**
   * @param {Buffer} chunk
   * @returns {{ frames: Buffer[], remainder: Buffer }}
   */
  append(chunk) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    const frames = [];

    while (this._buffer.length >= 2) {
      const start = this._buffer.indexOf(FRAME_MARKER);
      if (start === -1) {
        if (this._buffer.length > 1) {
          this._buffer = this._buffer.subarray(this._buffer.length - 1);
        }
        break;
      }

      if (start > 0) {
        this._buffer = this._buffer.subarray(start);
      }

      const nextStart = this._buffer.indexOf(FRAME_MARKER, FRAME_MARKER.length);
      if (nextStart === -1) {
        if (isCompleteFrame(this._buffer)) {
          frames.push(this._buffer);
          this._buffer = Buffer.alloc(0);
        }
        break;
      }

      frames.push(this._buffer.subarray(0, nextStart));
      this._buffer = this._buffer.subarray(nextStart);
    }

    return { frames, remainder: this._buffer };
  }

  reset() {
    this._buffer = Buffer.alloc(0);
  }
}
