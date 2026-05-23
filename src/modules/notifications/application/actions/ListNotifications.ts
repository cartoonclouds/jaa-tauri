import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Notification } from "@modules/notifications/domain/entities/Notification";

import { mapNotificationRowToEntity } from "@modules/notifications/application/mappers/mapNotificationRow";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export async function listNotifications(
  db: DatabaseDriver,
): Promise<Notification[]> {
  const rows = await db.select<Record<string, unknown>>(
    buildSelectAllOrderedQuery({
      tableName: "notifications",
      orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
    }),
  );

  return rows.map((row) => mapNotificationRowToEntity(row));
}
