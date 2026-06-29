import { EMAIL_TEMPLATE_TYPES } from "../../constant/email.js";
import { buildPasswordResetEmail } from "./passwordReset.template.js";

export const EMAIL_TEMPLATES = {
  [EMAIL_TEMPLATE_TYPES.PASSWORD_RESET_OTP]: buildPasswordResetEmail,
};
