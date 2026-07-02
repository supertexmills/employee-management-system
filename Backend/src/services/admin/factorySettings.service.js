import FactorySettings from "../../models/admin/factorySettings.model.js";
import { AppError } from "../../utils/AppError.js";
import { assertCanManageProduction } from "../rbac.service.js";

/** @type {object|null} in-memory cache, loaded once at boot */
let _cache = null;

/**
 * Return the cached settings object.
 * Must be called after initSettings() has run during bootstrap.
 */
export function getSettings() {
  if (!_cache) {
    throw new Error("FactorySettings not initialised — call initSettings() during bootstrap");
  }
  return _cache;
}

/**
 * Called once at server boot.
 * - On first ever boot: creates the singleton document using the provided seed values.
 * - On subsequent boots: loads the existing document from DB (ignores seed).
 * - Populates the in-memory cache used by all services.
 *
 * @param {object} seedDefaults  Values from env, used only if no DB document exists yet.
 */
export async function initSettings(seedDefaults = {}) {
  const defaults = {
    rfidEnabled: false,
    factoryTimezone: "Asia/Kolkata",
    defaultMinRoundIntervalSeconds: 1,
    countOutsideShift: false,
    ...seedDefaults,
  };

  const doc = await FactorySettings.findOneAndUpdate(
    { _key: "singleton" },
    { $setOnInsert: defaults },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  _cache = doc;
  return doc;
}

/**
 * Admin-facing update. Merges partial updates into the singleton document
 * and refreshes the in-memory cache.
 *
 * @param {object} actor  The authenticated admin making the change.
 * @param {object} body   Partial settings to update.
 */
export async function updateSettings(actor, body) {
  assertCanManageProduction(actor);

  const allowed = [
    "rfidEnabled",
    "factoryTimezone",
    "defaultMinRoundIntervalSeconds",
    "countOutsideShift",
  ];

  const updates = { updatedBy: actor._id };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 1) {
    throw new AppError("No valid settings fields provided", 400);
  }

  const doc = await FactorySettings.findOneAndUpdate(
    { _key: "singleton" },
    { $set: updates },
    { new: true }
  ).lean();

  if (!doc) throw new AppError("FactorySettings document not found", 404);

  _cache = doc;
  return doc;
}

/** Clears the in-memory cache (used in tests). */
export function clearSettingsCache() {
  _cache = null;
}
