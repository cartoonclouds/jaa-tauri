import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { SettingUpsertPayload } from "@modules/settings/repositories/SettingRepository";

import { useSettingService } from "@modules/settings";
import { createUpsertCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create upsert-style state and handlers for settings.
 */
export function useSetting() {
  const service = useSettingService();
  return createUpsertCrudComposable<Setting, SettingUpsertPayload>(service);
}
