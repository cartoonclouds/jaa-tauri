import { SettingRepository } from "@modules/settings/repositories/SettingRepository";
import { SettingService } from "@modules/settings/services/SettingService";
import { useNuxtApp } from "nuxt/app";

let settingServiceInstance: SettingService | null = null;

/**
 * Create a setting service instance backed by the injected database driver.
 */
export function useSettingService(): SettingService {
  if (!settingServiceInstance) {
    const { $database } = useNuxtApp();
    const database = $database;
    settingServiceInstance = new SettingService(
      new SettingRepository(database),
    );
  }

  return settingServiceInstance;
}
