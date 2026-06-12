import type { DatatablePageQuery } from "@shared/types";

import { CompanySchema } from "@modules/companies/domain/zod/company.schema";
import {
  type CompanyAssociatedApplication,
  type CompanyAssociatedContact,
  type CompanyCreatePayload,
  type CompanyUpdatePayload,
  type ICompanyRepository,
} from "@modules/companies/types";
import { mergeResolvedLocation } from "@shared/utils/geocoding";
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

    return this.repository.create(await mergeResolvedLocation(payload));
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

    return this.repository.update(await mergeResolvedLocation(payload));
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
