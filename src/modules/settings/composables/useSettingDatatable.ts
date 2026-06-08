import type { Setting } from "@modules/settings/domain/entities/Setting";

import { useSettingsService } from "@modules/settings";
import {
  SETTING_SEARCH_FIELDS,
  type SettingSearchField,
} from "@modules/settings/constants";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for settings.
 */
export function useSettingDatatable() {
  const { service } = useSettingsService();

  return useServerDatatable<Setting, SettingSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...SETTING_SEARCH_FIELDS],
  });
}
