import type { Setting } from "@modules/settings/domain/entities/Setting";

import { useSettingService } from "@modules/settings/services/useSettingService";

import { useServerDatatable } from "@/composables/useServerDatatable";

export function useSettingDatatable() {
  const service = useSettingService();

  return useServerDatatable<Setting>({
    fetchPage: (query) => service.listPage(query),
  });
}
