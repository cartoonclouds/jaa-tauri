import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { SettingUpsertPayload } from "@modules/settings/repositories/SettingRepository";

import { useSettingService } from "@modules/settings";
import { createUpsertCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates setting composable.
 */
function createSettingComposable() {
  const service = useSettingService();
  return createUpsertCrudComposable<Setting, SettingUpsertPayload>(service);
}

/**
 * Type alias for setting composable.
 */
type SettingComposable = ReturnType<typeof createSettingComposable>;

let settingComposableInstance: SettingComposable | null = null;

/**
 * Create upsert-style state and handlers for settings.
 */
export function useSetting() {
  settingComposableInstance ??= createSettingComposable();

  return settingComposableInstance;
}








