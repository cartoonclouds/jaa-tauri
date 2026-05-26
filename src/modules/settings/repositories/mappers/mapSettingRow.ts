import type { Setting } from "@modules/settings/domain/entities/Setting";

import { fromDbBoolean } from "@shared/utils/persistenceValueUtils";
import { mapAuditTimestamps } from "@shared/utils/rowDateUtils";

/**
 * Map a raw database row into a typed setting entity.
 */
export function mapSettingRowToEntity(row: Record<string, unknown>): Setting {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: String(row.id),
    theme: row.theme as Setting["theme"],
    locale: String(row.locale),
    notificationsEnabled: fromDbBoolean(row.notifications_enabled, true),
    developerMode: fromDbBoolean(row.developer_mode, false),
    ...timestamps,
  };
}
