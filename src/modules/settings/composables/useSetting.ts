import type { Setting } from "@modules/settings/domain/entities/Setting";
import type { SettingUpsertPayload } from "@modules/settings/types";

import { SettingRepository } from "@modules/settings/repositories/SettingRepository";
import { SettingService } from "@modules/settings/services/SettingService";
import { createUpsertCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createSettingService(): SettingService {
  const database = getNuxtDatabase();
  return new SettingService(new SettingRepository(database));
}

let settingServiceInstance: SettingService | null = null;

function getSettingService(): SettingService {
  settingServiceInstance ??= createSettingService();

  return settingServiceInstance;
}

/**
 * Creates setting composable.
 */
function createSettingComposable() {
  const service = getSettingService();
  const upsertCrudComposable = createUpsertCrudComposable<
    Setting,
    SettingUpsertPayload
  >(service);

  return {
    ...upsertCrudComposable,
    service,
  };
}

/**
 * Type alias for setting composable.
 */
type SettingComposable = ReturnType<typeof createSettingComposable>;

let settingComposableInstance: SettingComposable | null = null;

/**
 * Create upsert-style state and handlers for settings.
 */
export function useSettingsService() {
  settingComposableInstance ??= createSettingComposable();

  return settingComposableInstance;
}
