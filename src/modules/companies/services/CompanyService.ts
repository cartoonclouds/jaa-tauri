import {
  type CompanyCreatePayload,
  type CompanyUpdatePayload,
  type ICompanyRepository,
} from "@modules/companies/repositories/CompanyRepository";

export class CompanyService {
  constructor(private readonly repository: ICompanyRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: CompanyCreatePayload) {
    const name = payload.name.trim();
    if (!name) {
      throw new Error("Company name is required");
    }

    return this.repository.create({ ...payload, name });
  }

  update(payload: CompanyUpdatePayload) {
    if (payload.name !== undefined && !payload.name.trim()) {
      throw new Error("Company name cannot be empty");
    }

    return this.repository.update({
      ...payload,
      name: payload.name?.trim(),
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
