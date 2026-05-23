import type { PersistedConstantType } from "@modules/settings/constants/persistedConstantTypes";
import type { DatatablePageQuery } from "@shared/types";

import {
  type ConstantEntryUpsertPayload,
  type ISettingRepository,
  type SettingUpsertPayload,
} from "@modules/settings/repositories/SettingRepository";

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

  listConstantRows(type: PersistedConstantType) {
    return this.repository.listConstantRows(type);
  }

  upsertConstantRow(payload: ConstantEntryUpsertPayload) {
    return this.repository.upsertConstantRow(payload);
  }

  deleteConstantRow(type: PersistedConstantType, value: string) {
    return this.repository.deleteConstantRow(type, value);
  }
}
