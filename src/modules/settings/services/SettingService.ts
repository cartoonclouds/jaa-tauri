import type { PersistedConstantSourceType } from "@shared/constants/persistedConstants";
import type { DatatablePageQuery } from "@shared/types";

import {
  type ConstantEntryUpsertPayload,
  type ISettingRepository,
  type ListConstantRowsOptions,
  type SettingUpsertPayload,
} from "@modules/settings/repositories/SettingRepository";

/**
 * Application service facade for reading and mutating settings domain data.
 */
export class SettingService {
  constructor(private readonly repository: ISettingRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  upsert(payload: SettingUpsertPayload) {
    return this.repository.upsert(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  listConstantRows(
    type: PersistedConstantSourceType,
    options?: ListConstantRowsOptions,
  ) {
    return this.repository.listConstantRows(type, options);
  }

  upsertConstantRow(payload: ConstantEntryUpsertPayload) {
    return this.repository.upsertConstantRow(payload);
  }

  deleteConstantRow(type: PersistedConstantSourceType, value: string) {
    return this.repository.deleteConstantRow(type, value);
  }
}



