import type { Application } from "@modules/applications/domain/entities/Application";

import { useApplicationService } from "@modules/applications/services/useApplicationService";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for applications.
 */
export function useApplicationDatatable() {
  const service = useApplicationService();

  return useServerDatatable<Application>({
    fetchPage: (query) => service.listPage(query),
  });
}
