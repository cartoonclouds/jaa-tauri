import type { DatatablePageQuery } from "@shared/types";

import {
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
}
