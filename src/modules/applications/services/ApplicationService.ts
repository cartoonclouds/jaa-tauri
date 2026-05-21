import {
  type ApplicationCreatePayload,
  type ApplicationUpdatePayload,
  type IApplicationRepository,
} from "@modules/applications/repositories/ApplicationRepository";
import { ApplicationSchema } from "@shared/domain/zod/application.schema";

export class ApplicationService {
  constructor(private readonly repository: IApplicationRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: ApplicationCreatePayload) {
    const result = ApplicationSchema.pick({ title: true }).safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return this.repository.create(payload);
  }

  update(payload: ApplicationUpdatePayload) {
    if (payload.title !== undefined) {
      const result = ApplicationSchema.pick({ title: true }).safeParse({
        title: payload.title,
      });
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
    }

    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
