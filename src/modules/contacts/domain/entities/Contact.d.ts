import type { LocationFields, LocationFieldsInput } from "@shared/types";

/**
 * Supported contact categories.
 */
export type ContactType = "company" | "recruiter";

/**
 * All mutable data fields shared across contact read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface ContactBase extends LocationFields {
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
}

/**
 * Contact entity used for application networking data.
 * Extends {@link ContactBase} with system-managed fields.
 */
export interface Contact extends ContactBase {
  /** Unique contact identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a contact.
 * Derived from {@link ContactBase}: `fullName` and `type` are required; all
 * other base fields are optional; location fields accept undefined via
 * {@link LocationFieldsInput}.
 */
export type CreateContactInput = Pick<ContactBase, "fullName" | "type"> &
  Partial<Omit<ContactBase, "fullName" | "type" | keyof LocationFields>> &
  LocationFieldsInput;
