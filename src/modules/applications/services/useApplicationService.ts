import { ApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { useNuxtApp } from "nuxt/app";

/**
 * Create an application service instance backed by the injected database driver.
 */
export function useApplicationService(): ApplicationService {
  const { $database } = useNuxtApp();
  const database = $database;
  return new ApplicationService(new ApplicationRepository(database));
}
