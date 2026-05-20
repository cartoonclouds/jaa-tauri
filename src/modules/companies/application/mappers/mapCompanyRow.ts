import type { Company } from "@modules/companies/domain/entities/Company";

export function mapCompanyRowToEntity(row: Record<string, unknown>): Company {
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
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
