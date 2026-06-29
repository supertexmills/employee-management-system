import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./tests/setup/testEnv.js"],
    globalSetup: ["./tests/setup/globalSetup.js"],
    globalTeardown: ["./tests/setup/globalTeardown.js"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/**/*.dto.js"],
      thresholds: {
        lines: 25,
        functions: 25,
      },
    },
  },
});
