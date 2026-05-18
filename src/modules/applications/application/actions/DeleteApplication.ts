import type { ApplicationService } from "@modules/applications/services/ApplicationService";

export async function deleteApplication(
  service: ApplicationService,
  id: string,
): Promise<void> {
  await service.deleteApplication(id);
}
