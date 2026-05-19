import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";

export async function listContacts(db: DatabaseDriver): Promise<Contact[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM contacts ORDER BY created_at DESC",
  );

  return rows.map((row) => ({
    id: String(row.id),
    companyId: (row.company_id as string | null) ?? null,
    fullName: String(row.full_name),
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    linkedinUrl: (row.linkedin_url as string | null) ?? null,
    type: row.type === "recruiter" ? "recruiter" : "business",
    notes: (row.notes as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}
