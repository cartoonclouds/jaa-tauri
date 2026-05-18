import type { Application } from "@modules/applications/domain/entities/Application";
import type { CreateApplicationInput } from "@modules/applications/domain/types/ApplicationType";
import type { ApplicationService } from "@modules/applications/services/ApplicationService";

export async function createApplication(
  service: ApplicationService,
  input: CreateApplicationInput,
): Promise<Application> {
  return await service.createApplication(input);
}
