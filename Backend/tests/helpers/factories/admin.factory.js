import { ROLES } from "../../../src/constant/roles.js";
import Admin from "../../../src/models/admin/admin.model.js";

const DEFAULT_PASSWORD = "TestPass123!";

export async function createAdmin(overrides = {}) {
  const role = overrides.role ?? ROLES.SUPER_ADMIN;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return Admin.create({
    username: overrides.username ?? `user-${suffix}`,
    email: overrides.email ?? `${role}-${suffix}@test.local`,
    password: overrides.password ?? DEFAULT_PASSWORD,
    role,
    status: overrides.status ?? "active",
    createdBy: overrides.createdBy ?? null,
    ...overrides,
  });
}

export async function createSuperAdmin(overrides = {}) {
  return createAdmin({
    role: ROLES.SUPER_ADMIN,
    username: "superadmin",
    email: "admin@test.local",
    ...overrides,
  });
}

export async function createHrAdmin(overrides = {}) {
  return createAdmin({
    role: ROLES.HR,
    ...overrides,
  });
}

export { DEFAULT_PASSWORD };
