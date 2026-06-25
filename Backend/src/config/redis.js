import { env } from "./env.js";
import { logger } from "./logger.js";

let redisClient = null;

export async function getRedisConnection() {
  if (!env.redisUrl) {
    return null;
  }

  if (!redisClient) {
    const { default: Redis } = await import("ioredis");
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      logger.error({ err: err.message }, "redis_connection_error");
    });
  }

  if (redisClient.status === "wait") {
    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
