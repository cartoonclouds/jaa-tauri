import type { LocationFields, LocationFieldsInput } from "@shared/types";

/**
 * Supported contact categories.
 */
export type ContactType = "company" | "recruiter";

/**
 * Contact entity used for application networking data.
 */
export interface Contact extends LocationFields {
  /** Unique contact identifier. */
  id: string;
  /** Related company identifier, when available. */
  companyId: string | null;
  /** Full name of the contact. */
  fullName: string;
  /** Email address, when available. */
  email: string | null;
  /** Phone number, when available. */
  phone: string | null;
  /** LinkedIn profile URL, when available. */
  linkedinUrl: string | null;
  /** Contact category. */
  type: ContactType;
  /** Free-form notes about the contact. */
  notes: string | null;
  /** Associated tag identifiers. */
  tagIds: string[];
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a contact.
 */
export interface CreateContactInput extends LocationFieldsInput {
  /** Related company identifier, when available. */
  companyId?: string | null;
  /** Full name of the contact. */
  fullName: string;
  /** Contact category. */
  type: ContactType;
}
