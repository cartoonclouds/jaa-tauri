import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";

import { useApplicationService } from "@modules/applications";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Creates application composable.
 */
function createApplicationComposable() {
  const service = useApplicationService();
  return createCrudComposable<
    Application,
    ApplicationCreatePayload,
    ApplicationUpdatePayload
  >(service);
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








