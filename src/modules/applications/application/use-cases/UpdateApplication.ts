import type { Application } from "@modules/applications/domain/entities/Application";
import type { UpdateApplicationInput } from "@modules/applications/domain/types/ApplicationType";
import type { ApplicationService } from "@modules/applications/services/ApplicationService";

export async function updateApplication(
  service: ApplicationService,
  input: UpdateApplicationInput,
): Promise<Application> {
  return await service.updateApplication(input);
}
