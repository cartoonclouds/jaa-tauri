import type { Application } from "@modules/applications/domain/entities/Application";
import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/repositories/ApplicationRepository";

import { useApplicationService } from "@modules/applications/services/useApplicationService";
import { createCrudComposable } from "@shared/utils/crudComposableFactory";

export function useApplication() {
  const service = useApplicationService();
  return createCrudComposable<
    Application,
    ApplicationCreatePayload,
    ApplicationUpdatePayload
  >(service);
}
