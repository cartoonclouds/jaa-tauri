import type {
  ApplicationCreatePayload,
  ApplicationUpdatePayload,
} from "@modules/applications/types/payloads";
import type { DatatablePageQuery } from "@shared/types";

import { ApplicationSchema } from "@modules/applications/domain/zod/application.schema";
import { type IApplicationRepository } from "@modules/applications/repositories/ApplicationRepository";
import { resolveLocationFields } from "@shared/utils/geocoding";
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

    const resolvedLocation = await resolveLocationFields({
      locationText: payload.locationText,
      currentLatitude: payload.locationLat,
      currentLongitude: payload.locationLng,
    });

    return this.repository.create({
      ...payload,
      locationText: resolvedLocation.locationText,
      locationLat: resolvedLocation.locationLat,
      locationLng: resolvedLocation.locationLng,
    });
  }

  async update(payload: ApplicationUpdatePayload) {
    parseWithSchema(ApplicationSchema.pick({ title: true }), {
      title: payload.title,
    });

    if (payload.locationText === undefined) {
      return this.repository.update(payload);
    }

    const resolvedLocation = await resolveLocationFields({
      locationText: payload.locationText,
      currentLatitude: payload.locationLat,
      currentLongitude: payload.locationLng,
    });

    return this.repository.update({
      ...payload,
      locationText: resolvedLocation.locationText,
      locationLat: resolvedLocation.locationLat,
      locationLng: resolvedLocation.locationLng,
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
