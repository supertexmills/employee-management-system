import pino from "pino";
import { env } from "./env.js";

const devTransport =
  !env.isProduction && !env.isTest
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
          singleLine: false,
          messageFormat: "{msg}",
        },
      }
    : undefined;

export const logger = pino({
  level: env.isProduction ? "info" : env.isTest ? "warn" : "info",
  ...(devTransport
    ? { transport: devTransport }
    : env.isProduction
      ? {}
      : {
          transport: {
            target: "pino/file",
            options: { destination: 1 },
          },
        }),
});
