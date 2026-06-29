const lastRoundAtByKey = new Map();

function buildKey(epc, machineId) {
  return `${epc.toUpperCase()}:${machineId}`;
}

/**
 * Read-only debounce check — does not record a round.
 * @param {{ epc: string, machineId: string, intervalSeconds: number }} params
 * @returns {{ accept: boolean, reason: string|null }}
 */
export function checkDebounce({ epc, machineId, intervalSeconds }) {
  const key = buildKey(epc, machineId);
  const now = Date.now();
  const last = lastRoundAtByKey.get(key);

  if (last && now - last < intervalSeconds * 1000) {
    return { accept: false, reason: "debounce" };
  }

  return { accept: true, reason: null };
}

/**
 * Record a successful round for debounce tracking.
 * @param {{ epc: string, machineId: string }} params
 */
export function commitDebounce({ epc, machineId }) {
  const key = buildKey(epc, machineId);
  lastRoundAtByKey.set(key, Date.now());
}

/**
 * @param {{ epc: string, machineId: string, intervalSeconds: number }} params
 * @returns {{ accept: boolean, reason: string|null }}
 */
export function evaluateTagForRound({ epc, machineId, intervalSeconds }) {
  const result = checkDebounce({ epc, machineId, intervalSeconds });
  if (!result.accept) return result;
  commitDebounce({ epc, machineId });
  return { accept: true, reason: null };
}

export function resetTagFilterState() {
  lastRoundAtByKey.clear();
}
