import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";

import { toDate } from "@shared/utils/toDate";

export async function getSetting(
  db: DatabaseDriver,
  id = "app",
): Promise<Setting | null> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM settings WHERE id = $1 LIMIT 1",
    [id],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    theme: (row.theme as Setting["theme"]) ?? "system",
    locale: String(row.locale ?? "en-GB"),
    notificationsEnabled: Number(row.notifications_enabled ?? 1) === 1,
    developerMode: Number(row.developer_mode ?? 0) === 1,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
