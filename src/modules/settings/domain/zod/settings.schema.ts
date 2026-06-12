import { z } from "zod";

/** Runtime schema for app-level persisted settings. */
const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  showOverview: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  statsVisibility: z.record(
    z.union([
      z.boolean(),
      z.object({
        visible: z.boolean(),
        sortOrder: z.number().int().nullable().optional(),
      }),
    ]),
  ),
  onboardingCompleted: z.boolean(),
});

/** Runtime schema for upserting settings records in the repository layer. */
export const SettingRepositoryUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  locale: z.string().min(1).optional(),
  notificationsEnabled: z.boolean().optional(),
  developerMode: z.boolean().optional(),
});

/**
 * Type alias for app settings.
 */
export type AppSettings = z.infer<typeof SettingsSchema>;
