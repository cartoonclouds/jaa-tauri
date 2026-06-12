import type { Setting } from "@modules/settings/domain/entities/Setting";

import {
  fromDbBoolean,
  mapAuditTimestamps,
  normalizeLiteralValue,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

const SETTING_THEME_VALUES = ["system", "light", "dark"] as const;

/**
 * Map a raw database row into a typed setting entity.
 */
export function mapSettingRowToEntity(row: Record<string, unknown>): Setting {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    theme: normalizeLiteralValue(row.theme, SETTING_THEME_VALUES, "system"),
    locale: toRequiredString(row.locale),
    notificationsEnabled: fromDbBoolean(row.notifications_enabled, true),
    showOverview: fromDbBoolean(row.show_overview, true),
    developerMode: fromDbBoolean(row.developer_mode, false),
    ...timestamps,
  };
}
