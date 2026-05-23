import type { Setting } from "@modules/settings/domain/entities/Setting";

import { toDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed setting entity.
 */
export function mapSettingRowToEntity(row: Record<string, unknown>): Setting {
  return {
    id: String(row.id),
    theme: row.theme as Setting["theme"],
    locale: String(row.locale),
    notificationsEnabled: Number(row.notifications_enabled ?? 1) === 1,
    developerMode: Number(row.developer_mode ?? 0) === 1,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}



