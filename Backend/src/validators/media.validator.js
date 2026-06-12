import { z } from "zod";

export const avatarUserIdParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user id"),
});
