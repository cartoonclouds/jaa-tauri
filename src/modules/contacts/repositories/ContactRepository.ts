import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type { IRepository } from "@shared/types/repository";

import { toDate } from "@shared/utils/toDate";

export type ContactCreatePayload = Pick<
  Contact,
  | "companyId"
  | "fullName"
  | "email"
  | "phone"
  | "linkedinUrl"
  | "type"
  | "notes"
>;
export type ContactUpdatePayload = Partial<ContactCreatePayload> & {
  id: string;
};

export type IContactRepository = IRepository<
  Contact,
  ContactCreatePayload,
  ContactUpdatePayload
>;

export class ContactRepository implements IContactRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Contact[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      companyId: (row.company_id as string | null) ?? null,
      fullName: String(row.full_name),
      email: (row.email as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      linkedinUrl: (row.linkedin_url as string | null) ?? null,
      type: row.type as Contact["type"],
      notes: (row.notes as string | null) ?? null,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    }));
  }

  async create(payload: ContactCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO contacts (id, company_id, full_name, email, phone, linkedin_url, type, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        payload.companyId ?? null,
        payload.fullName,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        payload.type,
        payload.notes ?? null,
      ],
    );
    return id;
  }

  async update(payload: ContactUpdatePayload): Promise<void> {
    await this.db.execute(
      `UPDATE contacts
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           linkedin_url = COALESCE($4, linkedin_url),
           type = COALESCE($5, type),
           notes = COALESCE($6, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        payload.fullName ?? null,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        payload.type ?? null,
        payload.notes ?? null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM contacts WHERE id = $1", [id]);
  }
}
