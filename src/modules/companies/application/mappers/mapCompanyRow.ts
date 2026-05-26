import type { Company } from "@modules/companies/domain/entities/Company";

import {
  mapAuditTimestamps,
  toNullableString,
  toRequiredString,
} from "@shared/utils/database-mapping/mapperValueUtils";

/**
 * Map a raw database row into a typed company entity.
 */
export function mapCompanyRowToEntity(row: Record<string, unknown>): Company {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: toRequiredString(row.id),
    name: toRequiredString(row.name),
    websiteUrl: toNullableString(row.website_url),
    linkedinUrl: toNullableString(row.linkedin_url),
    industry: toNullableString(row.industry),
    size: toNullableString(row.size),
    locationText: toNullableString(row.location_text),
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    notes: toNullableString(row.notes),
    tagIds: [],
    ...timestamps,
  };
}
