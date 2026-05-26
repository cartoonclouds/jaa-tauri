import type { Setting } from "@modules/settings/domain/entities/Setting";

import { useSetting } from "@modules/settings";
import {
  SETTING_SEARCH_FIELDS,
  type SettingSearchField,
} from "@modules/settings/constants/settingDatatableFields";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for settings.
 */
export function useSettingDatatable() {
  const { service } = useSetting();

  return useServerDatatable<Setting, SettingSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...SETTING_SEARCH_FIELDS],
  });
}
