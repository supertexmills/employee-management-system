import { EmailProvider } from "./email.provider.js";

let lastSentEmail = null;

export class MemoryEmailProvider extends EmailProvider {
  async send(message) {
    lastSentEmail = {
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      sentAt: new Date(),
    };
  }

  async verify() {
    return true;
  }
}

export function getLastSentEmail() {
  return lastSentEmail;
}

export function clearLastSentEmail() {
  lastSentEmail = null;
}

export function extractOtpFromLastEmail() {
  if (!lastSentEmail?.text) return null;
  const match = lastSentEmail.text.match(/verification code is: (\d{6})/);
  return match ? { to: lastSentEmail.to, otp: match[1] } : null;
}
