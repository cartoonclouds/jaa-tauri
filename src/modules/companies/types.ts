import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  IPaginatedRepository,
  IRepository,
  LocationFieldsInput,
} from "@shared/types";

/**
 * Defines company create payload.
 */
export interface CompanyCreatePayload extends LocationFieldsInput {
  name: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  notes?: string | null;
  tagIds?: string[];
}

/**
 * Defines company update payload.
 */
export interface CompanyUpdatePayload extends LocationFieldsInput {
  id: string;
  name?: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  notes?: string | null;
  tagIds?: string[];
}

/**
 * Lightweight contact row associated with a company.
 */
export interface CompanyAssociatedContact {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  type: string;
}

/**
 * Lightweight application row associated with a company.
 */
export interface CompanyAssociatedApplication {
  id: string;
  title: string;
  status: string;
  appliedAt: string | null;
}

/**
 * Defines company repository contract.
 */
export interface ICompanyRepository
  extends
    IRepository<Company, CompanyCreatePayload, CompanyUpdatePayload>,
    IPaginatedRepository<Company> {
  listAssociatedContacts(
    companyId: string,
  ): Promise<CompanyAssociatedContact[]>;
  listAssociatedApplications(
    companyId: string,
  ): Promise<CompanyAssociatedApplication[]>;
}
