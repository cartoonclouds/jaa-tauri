import type { Contact } from "@modules/contacts/domain/entities/Contact";

import {
  mapAuditTimestamps,
  normalizeLiteralValue,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

const CONTACT_TYPE_VALUES = ["company", "recruiter"] as const;

/**
 * Map a raw database row into a typed contact entity.
 */
export function mapContactRowToEntity(row: Record<string, unknown>): Contact {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    companyId: toNullableString(row.company_id),
    fullName: toRequiredString(row.full_name),
    email: toNullableString(row.email),
    phone: toNullableString(row.phone),
    linkedinUrl: toNullableString(row.linkedin_url),
    locationText: toNullableString(row.location_text),
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    type: normalizeLiteralValue(row.type, CONTACT_TYPE_VALUES, "company"),
    notes: toNullableString(row.notes),
    tagIds: [],
    ...timestamps,
  };
}
