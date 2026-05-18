import type { Application } from "@modules/applications/domain/entities/Application";
import type { ApplicationService } from "@modules/applications/services/ApplicationService";

export async function getApplication(
  service: ApplicationService,
  id: string,
): Promise<Application | null> {
  return await service.getApplication(id);
}

export async function listApplications(
  service: ApplicationService,
): Promise<Application[]> {
  return await service.listApplications();
}
