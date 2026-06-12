import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type { DatatablePageQuery } from "@shared/types";

import { ApplicationSchema } from "@modules/applications/domain/zod/application.schema";
import { type IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { mergeResolvedLocation } from "@shared/utils/geocoding";
import { parseWithSchema } from "@shared/utils/zodValidation";

/**
 * Implements application service.
 */
export class ApplicationService {
  constructor(private readonly repository: IApplicationRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  async create(payload: ApplicationCreatePayload) {
    parseWithSchema(ApplicationSchema.pick({ title: true }), payload);

    return this.repository.create(await mergeResolvedLocation(payload));
  }

  async update(payload: ApplicationUpdatePayload) {
    parseWithSchema(ApplicationSchema.pick({ title: true }), {
      title: payload.title,
    });

    return this.repository.update(await mergeResolvedLocation(payload));
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
