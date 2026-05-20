import { z } from "zod";

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  sidebarCollapsed: z.boolean(),
  notificationsEnabled: z.boolean(),
  developerMode: z.boolean(),
  recentSearches: z.array(z.string()),
  tableColumnVisibility: z.record(z.boolean()),
  onboardingCompleted: z.boolean(),
});

export type AppSettings = z.infer<typeof SettingsSchema>;
