import type { LocationFields, LocationFieldsInput } from "@shared/types";

/**
 * Company entity used for application tracking.
 */
export interface Company extends LocationFields {
  /** Unique company identifier. */
  id: string;
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
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a company.
 */
export interface CreateCompanyInput extends LocationFieldsInput {
  /** Company name. */
  name: string;
}
