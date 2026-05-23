import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { toDate } from "@shared/utils/toDate";

/**
 * Map a raw database row into a typed contact entity.
 */
export function mapContactRowToEntity(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    companyId: (row.company_id as string | null) ?? null,
    fullName: String(row.full_name),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    locationText: (row.location_text as string | null) ?? null,
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    type: row.type === "recruiter" ? "recruiter" : "company",
    notes: (row.notes as string | null) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
