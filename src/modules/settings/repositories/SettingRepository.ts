import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";

export interface SettingUpsertPayload {
  id?: string;
  theme?: Setting["theme"];
  locale?: string;
  notificationsEnabled?: boolean;
  developerMode?: boolean;
}

export class SettingRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Setting[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM settings ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      theme: row.theme as Setting["theme"],
      locale: String(row.locale),
      notificationsEnabled: Number(row.notifications_enabled ?? 1) === 1,
      developerMode: Number(row.developer_mode ?? 0) === 1,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  }

  async upsert(payload: SettingUpsertPayload): Promise<string> {
    const id = payload.id ?? crypto.randomUUID();
    await this.db.execute(
      `INSERT INTO settings (id, theme, locale, notifications_enabled, developer_mode, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         theme = excluded.theme,
         locale = excluded.locale,
         notifications_enabled = excluded.notifications_enabled,
         developer_mode = excluded.developer_mode,
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        payload.theme ?? "system",
        payload.locale ?? "en-GB",
        payload.notificationsEnabled === false ? 0 : 1,
        payload.developerMode ? 1 : 0,
      ],
    );
    return id;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM settings WHERE id = $1", [id]);
  }
}
