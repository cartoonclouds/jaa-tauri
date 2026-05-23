import { SettingRepository } from "@modules/settings/repositories/SettingRepository";
import { SettingService } from "@modules/settings/services/SettingService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let settingServiceInstance: SettingService | null = null;

/**
 * Create a setting service instance backed by the injected database driver.
 */
export function useSettingService(): SettingService {
  if (!settingServiceInstance) {
    const database = getNuxtDatabase();
    settingServiceInstance = new SettingService(
      new SettingRepository(database),
    );
  }

  return settingServiceInstance;
}
