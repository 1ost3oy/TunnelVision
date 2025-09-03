import { z } from "zod";

const baseServerSchema = z.object({
  name: z.string().min(1, { message: "Server name is required" }),
  ipAddress: z.string().ip({ version: 'v4', message: "Invalid IP address" }),
  username: z.string().min(1, { message: 'Username is required' }),
  sshPort: z.coerce.number().int().min(1).max(65535).optional().default(22),
  password: z.string().optional().or(z.literal('')),
  sshKey: z.string().optional().or(z.literal('')),
});

export const serverSchema = baseServerSchema.refine(data => data.password || data.sshKey, {
    message: "Password or SSH Key is required",
    path: ["password"],
});

export const serverSchemaWithId = baseServerSchema.extend({
  id: z.string(),
});
