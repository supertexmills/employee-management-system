import { describe, it, expect, vi } from "vitest";
import { ZodError, z } from "zod";
import { AppError } from "../../../src/utils/AppError.js";
import { errorHandler } from "../../../src/middleware/errorHandler.js";

vi.mock("../../../src/config/env.js", () => ({
  env: { isProduction: false },
}));

vi.mock("../../../src/config/logger.js", () => ({
  logger: { error: vi.fn() },
}));

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe("errorHandler", () => {
  it("maps ZodError to 422 with field errors", () => {
    const res = mockRes();
    const schema = z.object({ email: z.string().email() });
    let err;
    try {
      schema.parse({ email: "not-an-email" });
    } catch (e) {
      err = e;
    }

    errorHandler(err, {}, res, () => {});

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors[0].path).toBe("email");
  });

  it("maps AppError to its status code", () => {
    const res = mockRes();
    errorHandler(new AppError("Forbidden", 403), {}, res, () => {});

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Forbidden");
  });

  it("maps JsonWebTokenError to 401", () => {
    const res = mockRes();
    const err = new Error("bad token");
    err.name = "JsonWebTokenError";

    errorHandler(err, {}, res, () => {});

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("maps duplicate key to 409", () => {
    const res = mockRes();
    const err = new Error("duplicate");
    err.code = 11000;
    err.keyPattern = { email: 1 };

    errorHandler(err, {}, res, () => {});

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("email already exists");
  });

  it("maps unknown errors to 500 with message in non-production", () => {
    const res = mockRes();
    const err = new Error("boom");

    errorHandler(err, {}, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("boom");
    expect(res.body.stack).toBeDefined();
  });
});
