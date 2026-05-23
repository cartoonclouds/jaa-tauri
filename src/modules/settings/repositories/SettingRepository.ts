import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { SETTING_SEARCH_FIELDS } from "@modules/settings/constants/settingDatatableFields";
import { mapSettingRowToEntity } from "@modules/settings/repositories/mappers/mapSettingRow";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

export interface SettingUpsertPayload {
  id?: string;
  theme?: Setting["theme"];
  locale?: string;
  notificationsEnabled?: boolean;
  developerMode?: boolean;
}

export type SettingCreatePayload = SettingUpsertPayload;
export type SettingUpdatePayload = SettingUpsertPayload & { id: string };

export interface ISettingRepository extends IRepository<
  Setting,
  SettingCreatePayload,
  SettingUpdatePayload
> {
  upsert(payload: SettingUpsertPayload): Promise<string>;
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Setting>>;
}

export class SettingRepository implements ISettingRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Setting[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "settings",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapSettingRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Setting>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      SETTING_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM settings
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM settings",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM settings
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM settings
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapSettingRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
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

  async create(payload: SettingCreatePayload): Promise<string> {
    return this.upsert(payload);
  }

  async update(payload: SettingUpdatePayload): Promise<void> {
    await this.upsert(payload);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM settings WHERE id = $1", [id]);
  }
}
