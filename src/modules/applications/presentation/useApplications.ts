import {
  useApplicationQuery,
  useApplicationsQuery,
  useCreateApplicationMutation,
  useDeleteApplicationMutation,
  useUpdateApplicationMutation,
} from "@modules/applications/queries/applicationQueries";
import { useApplicationUiStore } from "@modules/applications/stores/applicationUiStore";

export function useApplications() {
  const applications = useApplicationsQuery();
  const createApplication = useCreateApplicationMutation();
  const updateApplication = useUpdateApplicationMutation();
  const deleteApplication = useDeleteApplicationMutation();
  const ui = useApplicationUiStore();
  const selectedApplication = useApplicationQuery(
    () => ui.selectedApplicationId ?? "",
  );

  return {
    applications,
    selectedApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    ui,
  };
}
