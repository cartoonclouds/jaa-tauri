import { SettingRepository } from "@modules/settings/repositories/SettingRepository";
import { SettingService } from "@modules/settings/services/SettingService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create a setting service instance backed by the injected database driver.
 */
export function useSettingService(): SettingService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new SettingService(new SettingRepository(database));
}
