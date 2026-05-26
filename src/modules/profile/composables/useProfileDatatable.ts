import type { Profile } from "@modules/profile/domain/entities/Profile";

import { useProfile } from "@modules/profile";
import {
  PROFILE_SEARCH_FIELDS,
  type ProfileSearchField,
} from "@modules/profile/constants/profileDatatableFields";

import { useServerDatatable } from "@/composables/useServerDatatable";

/**
 * Create server-backed datatable state for profiles.
 */
export function useProfileDatatable() {
  const { service } = useProfile();

  return useServerDatatable<Profile, ProfileSearchField>({
    fetchPage: (query) => service.listPage(query),
    searchFields: [...PROFILE_SEARCH_FIELDS],
  });
}
