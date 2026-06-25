import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  ...(env.isProduction
    ? {}
    : {
        transport: {
          target: "pino/file",
          options: { destination: 1 },
        },
      }),
});
