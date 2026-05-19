import {
  type SettingRepository,
  type SettingUpsertPayload,
} from "@modules/settings/repositories/SettingRepository";

export class SettingService {
  constructor(private readonly repository: SettingRepository) {}

  list() {
    return this.repository.list();
  }

  upsert(payload: SettingUpsertPayload) {
    return this.repository.upsert(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
