import type { Setting } from "@modules/settings/domain/entities/Setting";

export function mapSettingRowToEntity(row: Record<string, unknown>): Setting {
  return {
    id: String(row.id),
    theme: row.theme as Setting["theme"],
    locale: String(row.locale),
    notificationsEnabled: Number(row.notifications_enabled ?? 1) === 1,
    developerMode: Number(row.developer_mode ?? 0) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
