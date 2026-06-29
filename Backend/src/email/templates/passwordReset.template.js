import { EMAIL_BRAND } from "../../constant/email.js";

export function buildPasswordResetEmail({ otp, expiresMinutes }) {
  const subject = "Your password reset code";
  const text = [
    `Hello,`,
    ``,
    `Your ${EMAIL_BRAND.displayName} verification code is: ${otp}`,
    ``,
    `This code expires in ${expiresMinutes} minutes.`,
    `Do not share this code with anyone.`,
    ``,
    `If you did not request a password reset, you can safely ignore this email.`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #333;">${EMAIL_BRAND.displayName}</h2>
      <p>Your verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #111;">${otp}</p>
      <p>This code expires in <strong>${expiresMinutes} minutes</strong>.</p>
      <p style="color: #666;">Do not share this code with anyone.</p>
      <p style="color: #999; font-size: 12px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `.trim();

  return { subject, text, html };
}
