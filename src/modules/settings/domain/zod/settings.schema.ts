import { z } from "zod";

/** Runtime schema for upserting settings records in the repository layer. */
export const SettingRepositoryUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  locale: z.string().min(1).optional(),
  notificationsEnabled: z.boolean().optional(),
  developerMode: z.boolean().optional(),
});
