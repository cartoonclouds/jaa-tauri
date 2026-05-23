import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import {
  PERSISTED_CONSTANT_TYPES,
  type PersistedConstantType,
} from "@modules/settings/constants/persistedConstantTypes";
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

export interface ConstantEntryRow {
  type: string;
  value: string;
  label: string | null;
}

export interface ConstantEntryUpsertPayload {
  type: PersistedConstantType;
  value: string;
  label: string | null;
  previousValue?: string;
}

function resolveSettingsLabel(type: PersistedConstantType): string {
  const typeSegments = type.split(".");
  const fallbackKey =
    typeSegments.length > 0 ? typeSegments[typeSegments.length - 1] : type;

  const key =
    Object.entries(PERSISTED_CONSTANT_TYPES).find(
      ([, persistedType]) => persistedType === type,
    )?.[0] ??
    fallbackKey ??
    type;

  return key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  getConstantRow(
    type: PersistedConstantType,
    value: string,
  ): Promise<ConstantEntryRow | null>;
  listConstantRows(type: PersistedConstantType): Promise<ConstantEntryRow[]>;
  upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void>;
  deleteConstantRow(type: PersistedConstantType, value: string): Promise<void>;
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

  async getConstantRow(
    type: PersistedConstantType,
    value: string,
  ): Promise<ConstantEntryRow | null> {
    const rows = await this.db.select<ConstantEntryRow>(
      `SELECT type, value, label
       FROM constants
       WHERE type = $1 AND value = $2
       LIMIT 1`,
      [type, value],
    );

    return rows[0] ?? null;
  }

  async listConstantRows(
    type: PersistedConstantType,
  ): Promise<ConstantEntryRow[]> {
    return await this.db.select<ConstantEntryRow>(
      `SELECT type, value, label
       FROM constants
       WHERE type = $1
       ORDER BY value ASC`,
      [type],
    );
  }

  async upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void> {
    const normalizedValue = payload.value.trim();
    const normalizedLabel = payload.label?.trim() ? payload.label.trim() : null;
    const settingsLabel = resolveSettingsLabel(payload.type);

    if (normalizedValue.length === 0) {
      throw new Error("Constant value cannot be empty");
    }

    const previousValue = payload.previousValue?.trim();

    if (previousValue && previousValue !== normalizedValue) {
      await this.db.transaction(async (tx) => {
        await tx.execute(
          `DELETE FROM constants
           WHERE type = $1 AND value = $2`,
          [payload.type, previousValue],
        );

        await tx.execute(
          `INSERT INTO constants (settings_label, type, value, label)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT(type, value) DO UPDATE SET
             label = excluded.label`,
          [settingsLabel, payload.type, normalizedValue, normalizedLabel],
        );
      });

      return;
    }

    await this.db.execute(
      `INSERT INTO constants (settings_label, type, value, label)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT(type, value) DO UPDATE SET
         label = excluded.label`,
      [settingsLabel, payload.type, normalizedValue, normalizedLabel],
    );
  }

  async deleteConstantRow(
    type: PersistedConstantType,
    value: string,
  ): Promise<void> {
    await this.db.execute(
      `DELETE FROM constants
       WHERE type = $1 AND value = $2`,
      [type, value],
    );
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
