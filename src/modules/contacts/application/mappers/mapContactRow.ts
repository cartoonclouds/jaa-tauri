import type { Contact } from "@modules/contacts/domain/entities/Contact";

import { toDate } from "@shared/utils/toDate";

export function mapContactRowToEntity(row: Record<string, unknown>): Contact {
  return {
    id: String(row.id),
    companyId: (row.company_id as string | null) ?? null,
    fullName: String(row.full_name),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    type: row.type === "recruiter" ? "recruiter" : "business",
    notes: (row.notes as string | null) ?? null,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}
