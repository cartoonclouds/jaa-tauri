import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Contact } from "@modules/contacts/domain/entities/Contact";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapContactRowToEntity } from "@modules/contacts/application/mappers/mapContactRow";
import { CONTACT_SEARCH_FIELDS } from "@modules/contacts/constants/contactDatatableFields";
import {
  ContactRepositoryCreateSchema,
  ContactTypeSchema,
} from "@modules/contacts/domain/zod/contact.schema";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

export type ContactCreatePayload = Pick<
  Contact,
  | "companyId"
  | "fullName"
  | "email"
  | "phone"
  | "linkedinUrl"
  | "locationText"
  | "locationLat"
  | "locationLng"
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
  listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedContact[]>;
}

export interface ApplicationLinkedContact {
  contact: Contact;
  companyName: string | null;
}

export class ContactRepository implements IContactRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Contact[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "contacts",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapContactRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Contact>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      CONTACT_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM contacts
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM contacts",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM contacts
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM contacts
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapContactRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async listByApplicationId(
    applicationId: string,
  ): Promise<ApplicationLinkedContact[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         c.*,
         co.name AS company_name
       FROM application_contacts ac
       INNER JOIN contacts c ON c.id = ac.contact_id
       LEFT JOIN companies co ON co.id = c.company_id
       WHERE ac.application_id = $1
       ORDER BY c.created_at DESC`,
      [applicationId],
    );

    return rows.map((row) => ({
      contact: mapContactRowToEntity(row),
      companyName: (row.company_name as string | null) ?? null,
    }));
  }

  async create(payload: ContactCreatePayload): Promise<string> {
    const parseResult = ContactRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error("Contact full name is required");
    }

    const fullName = parseResult.data.fullName.trim();
    if (!fullName) {
      throw new Error("Contact full name is required");
    }

    const parsedType = ContactTypeSchema.safeParse(parseResult.data.type);
    if (!parsedType.success) {
      throw new Error("Invalid contact type");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO contacts (id, company_id, full_name, email, phone, linkedin_url, location_text, location_lat, location_lng, type, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        parseResult.data.companyId ?? null,
        fullName,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        parseResult.data.locationText ?? null,
        parseResult.data.locationLat ?? null,
        parseResult.data.locationLng ?? null,
        parsedType.data,
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
           location_text = COALESCE($5, location_text),
           location_lat = COALESCE($6, location_lat),
           location_lng = COALESCE($7, location_lng),
           type = COALESCE($8, type),
           notes = COALESCE($9, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10`,
      [
        payload.fullName ?? null,
        payload.email ?? null,
        payload.phone ?? null,
        payload.linkedinUrl ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
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
