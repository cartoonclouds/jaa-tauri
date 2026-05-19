import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { UpsertSettingInput } from "@modules/settings/domain/entities/Setting";

export async function upsertSetting(
  db: DatabaseDriver,
  input: UpsertSettingInput,
): Promise<void> {
  const id = input.id ?? "app";

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
      input.theme ?? "system",
      input.locale ?? "en-GB",
      input.notificationsEnabled === false ? 0 : 1,
      input.developerMode === true ? 1 : 0,
    ],
  );
}
