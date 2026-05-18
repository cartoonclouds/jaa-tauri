import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@modules/applications/domain/types/ApplicationType";

import { useApplicationService } from "@modules/applications/services/useApplicationService";
import { defineQuery, useMutation, useQueryCache } from "@pinia/colada";

export const useApplicationsQuery = defineQuery(() => {
  const service = useApplicationService();

  return {
    key: ["applications"],
    query: () => service.listApplications(),
  };
});

export const useApplicationQuery = defineQuery(
  (id: MaybeRefOrGetter<string>) => {
    const service = useApplicationService();

    return {
      key: () => ["applications", toValue(id)],
      query: () => service.getApplication(toValue(id)),
    };
  },
);

export function useCreateApplicationMutation() {
  const queryCache = useQueryCache();
  const service = useApplicationService();

  return useMutation({
    mutation: (input: CreateApplicationInput) =>
      service.createApplication(input),

    async onSuccess() {
      await queryCache.invalidateQueries({ key: ["applications"] });
    },
  });
}

export function useUpdateApplicationMutation() {
  const queryCache = useQueryCache();
  const service = useApplicationService();

  return useMutation({
    mutation: (input: UpdateApplicationInput) =>
      service.updateApplication(input),

    async onSuccess(application) {
      await Promise.all([
        queryCache.invalidateQueries({ key: ["applications"] }),
        queryCache.invalidateQueries({ key: ["applications", application.id] }),
      ]);
    },
  });
}

export function useDeleteApplicationMutation() {
  const queryCache = useQueryCache();
  const service = useApplicationService();

  return useMutation({
    mutation: (id: string) => service.deleteApplication(id),

    async onSuccess() {
      await queryCache.invalidateQueries({ key: ["applications"] });
    },
  });
}
