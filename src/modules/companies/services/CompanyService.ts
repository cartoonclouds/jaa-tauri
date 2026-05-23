import type { DatatablePageQuery } from "@shared/types";

import {
  type CompanyCreatePayload,
  type CompanyUpdatePayload,
  type ICompanyRepository,
} from "@modules/companies/repositories/CompanyRepository";
import { CompanySchema } from "@modules/companies/domain/zod/company.schema";

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

  create(payload: CompanyCreatePayload) {
    const result = CompanySchema.pick({ name: true }).safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }

    return this.repository.create(payload);
  }

  update(payload: CompanyUpdatePayload) {
    if (payload.name !== undefined) {
      const result = CompanySchema.pick({ name: true }).safeParse({
        name: payload.name,
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








