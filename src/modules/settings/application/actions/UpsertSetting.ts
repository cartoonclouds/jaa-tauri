import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { UpsertSettingInput } from "@modules/settings/domain/entities/Setting";

import { z } from "zod";

const UpsertSettingSchema = z.object({
  id: z.string().min(1).optional(),
  theme: z.enum(["system", "light", "dark"]).optional(),
  locale: z.string().min(1).optional(),
  notificationsEnabled: z.boolean().optional(),
  developerMode: z.boolean().optional(),
});

export async function upsertSetting(
  db: DatabaseDriver,
  input: UpsertSettingInput,
): Promise<void> {
  const parseResult = UpsertSettingSchema.safeParse(input);
  if (!parseResult.success) {
    throw new Error(
      "Setting validation failed: " +
        JSON.stringify(parseResult.error.format()),
    );
  }

  const validated = parseResult.data;
  const id = validated.id ?? "app";

  await db.execute(
    `
    INSERT INTO settings (
      id,
      theme,
      locale,
      notifications_enabled,
      developer_mode,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      theme = excluded.theme,
      locale = excluded.locale,
      notifications_enabled = excluded.notifications_enabled,
      developer_mode = excluded.developer_mode,
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      id,
      validated.theme ?? "system",
      validated.locale ?? "en-GB",
      validated.notificationsEnabled === false ? 0 : 1,
      validated.developerMode === true ? 1 : 0,
    ],
  );
}
