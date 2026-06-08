import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { PersistedConstantSourceType } from "@shared/constants/persistedConstants";
import type { IPaginatedRepository, IRepository } from "@shared/types";

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
export interface ISettingRepository
  extends
    IRepository<Setting, SettingCreatePayload, SettingUpdatePayload>,
    IPaginatedRepository<Setting> {
  get(id?: string): Promise<Setting | null>;
  upsert(payload: SettingUpsertPayload): Promise<string>;
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
