import type { DatatablePageQuery } from "@shared/types";

import { CompanySchema } from "@modules/companies/domain/zod/company.schema";
import {
  type CompanyAssociatedApplication,
  type CompanyAssociatedContact,
  type CompanyCreatePayload,
  type CompanyUpdatePayload,
  type ICompanyRepository,
} from "@modules/companies/repositories/CompanyRepository";
import { resolveLocationFields } from "@shared/utils/geocoding";
import { parseWithSchema } from "@shared/utils/zodValidation";

/**
 * Implements company service.
 */
export class CompanyService {
  constructor(private readonly repository: ICompanyRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  listAssociatedContacts(
    companyId: string,
  ): Promise<CompanyAssociatedContact[]> {
    return this.repository.listAssociatedContacts(companyId);
  }

  listAssociatedApplications(
    companyId: string,
  ): Promise<CompanyAssociatedApplication[]> {
    return this.repository.listAssociatedApplications(companyId);
  }

  async create(payload: CompanyCreatePayload) {
    parseWithSchema(CompanySchema.pick({ name: true }), payload);

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

  async update(payload: CompanyUpdatePayload) {
    if (payload.name !== undefined) {
      parseWithSchema(CompanySchema.pick({ name: true }), {
        name: payload.name,
      });
    }

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
