import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { SettingUpsertPayload } from "@modules/settings/repositories/SettingRepository";

import { useSettingService } from "@modules/settings/services/useSettingService";
import { createUpsertCrudComposable } from "@shared/utils/crudComposableFactory";

export function useSetting() {
  const service = useSettingService();
  return createUpsertCrudComposable<Setting, SettingUpsertPayload>(service);
}
