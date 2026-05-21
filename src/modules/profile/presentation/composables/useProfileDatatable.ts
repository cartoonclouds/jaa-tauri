import type { Profile } from "@modules/profile/domain/entities/Profile";

import { useProfileService } from "@modules/profile/services/useProfileService";

import { useServerDatatable } from "@/composables/useServerDatatable";

export function useProfileDatatable() {
  const service = useProfileService();

  return useServerDatatable<Profile>({
    fetchPage: (query) => service.listPage(query),
  });
}
