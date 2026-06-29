/**
 * Extract EPC tags from a single complete frame (hex string).
 * @param {string} frameHex - Uppercase hex of one frame (may include AAAA prefix)
 * @returns {{ epc: string, rssi: number|null, antennaId: number|null }[]}
 */
export function extractTagsFromFrame(frameHex) {
  const tags = [];
  const normalized = frameHex.toUpperCase();
  const match = normalized.match(/3000(E280[0-9A-F]{20})/i);
  if (match) {
    tags.push({
      epc: match[1].toUpperCase(),
      rssi: null,
      antennaId: null,
    });
  }
  return tags;
}

/**
 * Extract EPC tags from one or more frames (hex string, may contain multiple AAAA frames).
 * @param {string} rawHex
 * @returns {{ epc: string, rssi: number|null, antennaId: number|null }[]}
 */
export function extractTagsFromHex(rawHex) {
  const tags = [];
  const frames = rawHex.toUpperCase().split("AAAA").filter(Boolean);

  for (const frame of frames) {
    const fullFrame = "AAAA" + frame;
    tags.push(...extractTagsFromFrame(fullFrame));
  }

  return tags;
}
