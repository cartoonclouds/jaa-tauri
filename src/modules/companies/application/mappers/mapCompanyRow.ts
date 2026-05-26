import type { Company } from "@modules/companies/domain/entities/Company";

import { mapAuditTimestamps } from "@shared/utils/rowDateUtils";

/**
 * Map a raw database row into a typed company entity.
 */
export function mapCompanyRowToEntity(row: Record<string, unknown>): Company {
  const timestamps = mapAuditTimestamps({
    created_at: row.created_at,
    updated_at: row.updated_at,
  });

  return {
    id: String(row.id),
    name: String(row.name),
    websiteUrl: (row.website_url as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    industry: (row.industry as string | null) ?? null,
    size: (row.size as string | null) ?? null,
    locationText: (row.location_text as string | null) ?? null,
    locationLat: (row.location_lat as number | null) ?? null,
    locationLng: (row.location_lng as number | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    tagIds: [],
    ...timestamps,
  };
}
