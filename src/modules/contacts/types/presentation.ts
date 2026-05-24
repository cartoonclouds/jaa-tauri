import type { ContactType } from "@modules/contacts/domain/entities/Contact";

/**
 * Editable contact snapshot used by contact editor UI flows.
 */
export interface EditableContact {
  id: string;
  fullName: string;
  type: ContactType;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  notes: string | null;
}
