import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";

import { ApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { ApplicationService } from "@modules/applications/services/ApplicationService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";
import { getNuxtDatabase } from "@shared/utils/getNuxtDatabase";

function createApplicationService(): ApplicationService {
  const database = getNuxtDatabase();
  return new ApplicationService(new ApplicationRepository(database));
}

let applicationServiceInstance: ApplicationService | null = null;

function getApplicationService(): ApplicationService {
  applicationServiceInstance ??= createApplicationService();

  return applicationServiceInstance;
}

/**
 * Creates application composable.
 */
function createApplicationComposable() {
  const service = getApplicationService();
  const crudComposable = createCrudComposable<
    Application,
    ApplicationCreatePayload,
    ApplicationUpdatePayload
  >(service);

  return {
    ...crudComposable,
    service,
  };
}

/**
 * Type alias for application composable.
 */
type ApplicationComposable = ReturnType<typeof createApplicationComposable>;

let applicationComposableInstance: ApplicationComposable | null = null;

/**
 * Create CRUD state and handlers for applications.
 */
export function useApplication() {
  applicationComposableInstance ??= createApplicationComposable();

  return applicationComposableInstance;
}
