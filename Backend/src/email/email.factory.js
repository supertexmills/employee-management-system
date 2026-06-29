import { env } from "../config/env.js";
import { MemoryEmailProvider } from "./providers/memory.provider.js";
import { SmtpEmailProvider } from "./providers/smtp.provider.js";

let providerInstance = null;

export function createEmailProvider() {
  if (providerInstance) return providerInstance;

  if (env.isTest || env.emailProvider === "memory") {
    providerInstance = new MemoryEmailProvider();
  } else {
    providerInstance = new SmtpEmailProvider();
  }

  return providerInstance;
}

export function resetEmailProvider() {
  providerInstance = null;
}
