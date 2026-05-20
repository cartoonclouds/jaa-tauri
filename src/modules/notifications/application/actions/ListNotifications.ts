import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";

import { mapNotificationRowToEntity } from "@modules/notifications/application/mappers/mapNotificationRow";

export async function listNotifications(
  db: DatabaseDriver,
): Promise<Notification[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM notifications ORDER BY created_at DESC",
  );

  return rows.map((row) => mapNotificationRowToEntity(row));
}
