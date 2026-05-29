import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Setting } from "@modules/settings/domain/entities/Setting";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { SETTING_SEARCH_FIELDS } from "@modules/settings/constants";
import { SettingRepositoryUpsertSchema } from "@modules/settings/domain/zod/settings.schema";
import { mapSettingRowToEntity } from "@modules/settings/repositories/mappers/mapSettingRow";
import {
  CONSTANT_MODULE_SOURCES,
  type PersistedConstantSourceType,
} from "@shared/constants/persistedConstants";
import { normalizeConstantValue } from "@shared/utils/constantValue";
import { fromDbBoolean } from "@shared/utils/database-mapping/persistenceValueUtils";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

/**
 * Upsert payload for the application-wide settings record.
 */
export interface SettingUpsertPayload {
  id?: string;
  theme?: Setting["theme"];
  locale?: string;
  notificationsEnabled?: boolean;
  developerMode?: boolean;
}

/**
 * Constant row shape returned from persistence with UI-friendly visibility mapping.
 */
export interface ConstantEntryRow {
  type: string;
  value: string;
  label: string | null;
  isVisible: boolean;
}

/**
 * Payload used to insert or update a constant row.
 */
export interface ConstantEntryUpsertPayload {
  type: PersistedConstantSourceType;
  value: string;
  label: string | null;
  isVisible?: boolean;
  previousValue?: string;
}

/**
 * Query options for loading constant rows.
 */
export interface ListConstantRowsOptions {
  includeHidden?: boolean;
}

/**
 * Resolves settings label.
 */
function resolveSettingsLabel(type: PersistedConstantSourceType): string {
  const typeSegments = type.split(".");
  const fallbackKey =
    typeSegments.length > 0 ? typeSegments[typeSegments.length - 1] : type;

  let key: string = fallbackKey ?? type;

  for (const source of CONSTANT_MODULE_SOURCES) {
    for (const exportName of Object.keys(source.module)) {
      if (`${source.namespace}.${exportName}` === type) {
        key = exportName;
        break;
      }
    }
  }

  return key
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Type alias for setting create payload.
 */
export type SettingCreatePayload = SettingUpsertPayload;
/**
 * Type alias for setting update payload.
 */
export type SettingUpdatePayload = SettingUpsertPayload & { id: string };

/**
 * Repository contract for persisted settings and editable constant rows.
 */
export interface ISettingRepository extends IRepository<
  Setting,
  SettingCreatePayload,
  SettingUpdatePayload
> {
  get(id?: string): Promise<Setting | null>;
  upsert(payload: SettingUpsertPayload): Promise<string>;
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Setting>>;
  getConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<ConstantEntryRow | null>;
  listConstantRows(
    type: PersistedConstantSourceType,
    options?: ListConstantRowsOptions,
  ): Promise<ConstantEntryRow[]>;
  upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void>;
  deleteConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<void>;
}

/**
 * SQLite-backed repository for settings and constant metadata management.
 */
export class SettingRepository implements ISettingRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private toConstantEntryRow(row: {
    type: string;
    value: string;
    label: string | null;
    is_visible: number | boolean;
  }): ConstantEntryRow {
    return {
      type: row.type,
      value: normalizeConstantValue(row.value),
      label: row.label,
      isVisible: fromDbBoolean(row.is_visible, false),
    };
  }

  async get(id = "app"): Promise<Setting | null> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM settings WHERE id = $1 LIMIT 1",
      [id],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return mapSettingRowToEntity(row);
  }

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
    const parseResult = SettingRepositoryUpsertSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error(
        "Setting validation failed: " +
          JSON.stringify(parseResult.error.format()),
      );
    }

    const validated = parseResult.data;
    const id = validated.id ?? "app";

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
        validated.theme ?? "system",
        validated.locale ?? "en-GB",
        validated.notificationsEnabled === false ? 0 : 1,
        validated.developerMode === true ? 1 : 0,
      ],
    );
    return id;
  }

  async getConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<ConstantEntryRow | null> {
    const normalizedLookupValue = normalizeConstantValue(value);
    const rows = await this.db.select<{
      type: string;
      value: string;
      label: string | null;
      is_visible: number | boolean;
    }>(
      `SELECT type, value, label, is_visible
       FROM constants
       WHERE type = $1 AND value = $2
       LIMIT 1`,
      [type, normalizedLookupValue],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return this.toConstantEntryRow(row);
  }

  async listConstantRows(
    type: PersistedConstantSourceType,
    options: ListConstantRowsOptions = {},
  ): Promise<ConstantEntryRow[]> {
    const rows = await this.db.select<{
      type: string;
      value: string;
      label: string | null;
      is_visible: number | boolean;
    }>(
      `SELECT type, value, label, is_visible
       FROM constants
       WHERE type = $1
         AND ($2 = 1 OR is_visible = 1)
       ORDER BY value ASC`,
      [type, options.includeHidden === true ? 1 : 0],
    );

    return rows.map((row) => this.toConstantEntryRow(row));
  }

  async upsertConstantRow(payload: ConstantEntryUpsertPayload): Promise<void> {
    const normalizedValue = normalizeConstantValue(payload.value);
    const normalizedLabel = payload.label?.trim() ? payload.label.trim() : null;
    const normalizedIsVisible = payload.isVisible !== false;
    const settingsLabel = resolveSettingsLabel(payload.type);

    if (normalizedValue.length === 0) {
      throw new Error("Constant value cannot be empty");
    }

    const previousValue = payload.previousValue
      ? normalizeConstantValue(payload.previousValue)
      : undefined;

    if (previousValue && previousValue !== normalizedValue) {
      await this.db.transaction(async (tx) => {
        await tx.execute(
          `DELETE FROM constants
           WHERE type = $1 AND value = $2`,
          [payload.type, previousValue],
        );

        await tx.execute(
          `INSERT INTO constants (settings_label, type, value, label, is_visible)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT(type, value) DO UPDATE SET
             label = excluded.label,
             is_visible = excluded.is_visible`,
          [
            settingsLabel,
            payload.type,
            normalizedValue,
            normalizedLabel,
            normalizedIsVisible ? 1 : 0,
          ],
        );
      });

      return;
    }

    await this.db.execute(
      `INSERT INTO constants (settings_label, type, value, label, is_visible)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT(type, value) DO UPDATE SET
         label = excluded.label,
         is_visible = excluded.is_visible`,
      [
        settingsLabel,
        payload.type,
        normalizedValue,
        normalizedLabel,
        normalizedIsVisible ? 1 : 0,
      ],
    );
  }

  async deleteConstantRow(
    type: PersistedConstantSourceType,
    value: string,
  ): Promise<void> {
    const normalizedValue = normalizeConstantValue(value);
    await this.db.execute(
      `DELETE FROM constants
       WHERE type = $1 AND value = $2`,
      [type, normalizedValue],
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
