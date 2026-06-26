import { Queue } from "bullmq";
import { Worker } from "bullmq";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { getRedisConnection, closeRedisConnection } from "../config/redis.js";
import { AppError } from "../utils/AppError.js";
import { EMAIL_JOB_TYPES, EMAIL_QUEUE_NAME } from "./email.types.js";
import {
  processEmailJob,
  setEmailWorkerHealthy,
} from "./email.worker.js";

let emailQueue = null;
let emailWorker = null;

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: true,
  removeOnFail: 100,
};

async function getQueue() {
  if (emailQueue) return emailQueue;

  const connection = await getRedisConnection();
  if (!connection) {
    throw new Error("Redis is not configured");
  }

  emailQueue = new Queue(EMAIL_QUEUE_NAME, { connection });
  return emailQueue;
}

export async function enqueuePasswordResetEmail({ email, otp, resetId }) {
  const jobData = {
    type: EMAIL_JOB_TYPES.PASSWORD_RESET_OTP,
    email,
    otp,
    resetId: resetId.toString(),
  };

  if (env.isTest) {
    await processEmailJob(jobData);
    return;
  }

  try {
    const queue = await getQueue();
    await queue.add(EMAIL_JOB_TYPES.PASSWORD_RESET_OTP, jobData, JOB_OPTIONS);
  } catch (err) {
    logger.error({ err: err.message, resetId }, "email_enqueue_failed");

    if (env.isProduction) {
      throw new AppError("Unable to send verification email. Please try again later.", 503);
    }

    if (!env.isProduction) {
      logger.warn({ emailHash: email }, "Falling back to inline email processing in dev");
      await processEmailJob(jobData);
    }
  }
}

export async function startEmailWorker({ quiet = false } = {}) {
  if (env.isTest) {
    setEmailWorkerHealthy(true);
    return;
  }

  try {
    const connection = await getRedisConnection();
    if (!connection) {
      if (quiet) {
        logger.debug("Redis not configured — email worker not started");
      } else {
        logger.warn("Redis not configured — email worker not started");
      }
      setEmailWorkerHealthy(false);
      return;
    }

    emailWorker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
        await processEmailJob(job.data);
      },
      { connection },
    );

    emailWorker.on("ready", () => {
      setEmailWorkerHealthy(true);
      if (quiet) {
        logger.debug("email_worker_ready");
      } else {
        logger.info("email_worker_ready");
      }
    });

    emailWorker.on("failed", (job, err) => {
      logger.error(
        { jobId: job?.id, err: err.message, attemptsMade: job?.attemptsMade },
        "email_worker_job_failed",
      );
    });

    emailWorker.on("error", (err) => {
      setEmailWorkerHealthy(false);
      logger.error({ err: err.message }, "email_worker_error");
    });
  } catch (err) {
    logger.warn({ err: err.message }, "email_worker_start_failed");
    setEmailWorkerHealthy(false);
  }
}

export async function stopEmailWorker() {
  if (emailWorker) {
    await emailWorker.close();
    emailWorker = null;
  }

  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
  }

  await closeRedisConnection();
  setEmailWorkerHealthy(false);
}

export async function getEmailQueueForTests() {
  return getQueue();
}
