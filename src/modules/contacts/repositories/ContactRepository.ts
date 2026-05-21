import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

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

export interface IContactRepository extends IRepository<
  Contact,
  ContactCreatePayload,
  ContactUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Contact>>;
}

export class ContactRepository implements IContactRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private mapContactRow(row: Record<string, unknown>): Contact {
    return {
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
    };
  }

  async list(): Promise<Contact[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );
    return rows.map((row) => this.mapContactRow(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Contact>> {
    const rows = Math.max(1, query.rows);
    const page = Math.max(0, query.page);
    const search = query.search?.trim() ?? "";
    const hasSearch = search.length > 0;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM contacts WHERE full_name LIKE $1 OR COALESCE(email, '') LIKE $1 OR type LIKE $1",
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM contacts",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM contacts
           WHERE full_name LIKE $1 OR COALESCE(email, '') LIKE $1 OR type LIKE $1
           ORDER BY created_at DESC
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM contacts
           ORDER BY created_at DESC
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => this.mapContactRow(row)),
      total: totalRows[0]?.total ?? 0,
    };
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
