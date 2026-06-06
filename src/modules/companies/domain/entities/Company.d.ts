import type { LocationFields, LocationFieldsInput } from "@shared/types";

/**
 * All mutable data fields shared across company read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface CompanyBase extends LocationFields {
  /** Company name. */
  name: string;
  /** Company website URL, when available. */
  websiteUrl: string | null;
  /** LinkedIn company URL, when available. */
  linkedinUrl: string | null;
  /** Industry classification, when available. */
  industry: string | null;
  /** Company size descriptor, when available. */
  size: string | null;
  /** Additional notes about the company. */
  notes: string | null;
  /** Associated tag identifiers. */
  tagIds: string[];
}

/**
 * Company entity used for application tracking.
 * Extends {@link CompanyBase} with system-managed fields.
 */
export interface Company extends CompanyBase {
  /** Unique company identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a company.
 * Derived from {@link CompanyBase}: `name` is required; all other base fields
 * are optional; location fields accept undefined via {@link LocationFieldsInput}.
 */
export type CreateCompanyInput = Pick<CompanyBase, "name"> &
  Partial<Omit<CompanyBase, "name" | keyof LocationFields>> &
  LocationFieldsInput;
