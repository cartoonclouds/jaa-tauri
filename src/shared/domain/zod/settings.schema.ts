import { z } from "zod";

import { ProfileSchema } from "./profile.schema";

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  sidebarCollapsed: z.boolean(),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  onboardingCompleted: z.boolean(),
  userProfile: ProfileSchema,
});

export type AppSettings = z.infer<typeof SettingsSchema>;
