import { ApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

let applicationServiceInstance: ApplicationService | null = null;

/**
 * Create an application service instance backed by the injected database driver.
 */
export function useApplicationService(): ApplicationService {
  if (!applicationServiceInstance) {
    const database = getNuxtDatabase();
    applicationServiceInstance = new ApplicationService(
      new ApplicationRepository(database),
    );
  }

  return applicationServiceInstance;
}



