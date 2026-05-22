import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";

import { useApplicationService } from "@modules/applications";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

/**
 * Create CRUD state and handlers for applications.
 */
export function useApplication() {
  const service = useApplicationService();
  return createCrudComposable<
    Application,
    ApplicationCreatePayload,
    ApplicationUpdatePayload
  >(service);
}
