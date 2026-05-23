import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type { DatatablePageQuery } from "@shared/types";

import { ApplicationSchema } from "@modules/applications/domain/zod/application.schema";
import { type IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";

export class ApplicationService {
  constructor(private readonly repository: IApplicationRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: ApplicationCreatePayload) {
    const result = ApplicationSchema.pick({ title: true }).safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return this.repository.create(payload);
  }

  update(payload: ApplicationUpdatePayload) {
    const result = ApplicationSchema.pick({ title: true }).safeParse({
      title: payload.title,
    });
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
