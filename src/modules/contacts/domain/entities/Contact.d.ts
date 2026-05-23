/**
 * Supported contact categories.
 */
export type ContactType = "company" | "recruiter";

/**
 * Contact entity used for application networking data.
 */
export interface Contact {
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
  /** Free-form location text for the contact. */
  locationText: string | null;
  /** Latitude for the contact location. */
  locationLat: number | null;
  /** Longitude for the contact location. */
  locationLng: number | null;
  /** Contact category. */
  type: ContactType;
  /** Free-form notes about the contact. */
  notes: string | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a contact.
 */
export interface CreateContactInput {
  /** Related company identifier, when available. */
  companyId?: string | null;
  /** Full name of the contact. */
  fullName: string;
  /** Free-form location text for the contact. */
  locationText?: string | null;
  /** Latitude for the contact location. */
  locationLat?: number | null;
  /** Longitude for the contact location. */
  locationLng?: number | null;
  /** Contact category. */
  type: ContactType;
}
