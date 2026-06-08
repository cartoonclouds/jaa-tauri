import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IPaginatedRepository,
  IRepository,
  LocationFieldsInput,
} from "@shared/types";

import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";
import { COMPANY_SEARCH_FIELDS } from "@modules/companies/constants";
import { CompanyRepositoryCreateSchema } from "@modules/companies/domain/zod/company.schema";
import { ValidationError } from "@shared/domain/errors";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";
import {
  listTagIdsForEntity,
  syncTagIdsForEntity,
} from "@shared/utils/tagAssociations";

/**
 * Defines company create payload.
 */
export interface CompanyCreatePayload extends LocationFieldsInput {
  name: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  notes?: string | null;
  tagIds?: string[];
}

/**
 * Defines company update payload.
 */
export interface CompanyUpdatePayload extends LocationFieldsInput {
  id: string;
  name?: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  notes?: string | null;
  tagIds?: string[];
}

/**
 * Lightweight contact row associated with a company.
 */
export interface CompanyAssociatedContact {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  type: string;
}

/**
 * Lightweight application row associated with a company.
 */
export interface CompanyAssociatedApplication {
  id: string;
  title: string;
  status: string;
  appliedAt: string | null;
}

/**
 * Defines icompany repository.
 */
export interface ICompanyRepository
  extends
    IRepository<Company, CompanyCreatePayload, CompanyUpdatePayload>,
    IPaginatedRepository<Company> {
  listAssociatedContacts(
    companyId: string,
  ): Promise<CompanyAssociatedContact[]>;
  listAssociatedApplications(
    companyId: string,
  ): Promise<CompanyAssociatedApplication[]>;
}

/**
 * Implements company repository.
 */
export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private async withTags(company: Company): Promise<Company> {
    return {
      ...company,
      tagIds: await listTagIdsForEntity(this.db, "company", company.id),
    };
  }

  async list(): Promise<Company[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "companies",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );

    return Promise.all(
      rows.map(async (row) => this.withTags(mapCompanyRowToEntity(row))),
    );
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Company>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      COMPANY_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM companies
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM companies",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM companies
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM companies
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: await Promise.all(
        listRows.map(async (row) => this.withTags(mapCompanyRowToEntity(row))),
      ),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: CompanyCreatePayload): Promise<string> {
    const parseResult = CompanyRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      console.error("CompanyRepository.create validation failed", {
        payload,
        error: parseResult.error,
      });
      throw new ValidationError("Company name is required");
    }

    const name = parseResult.data.name.trim();
    if (!name) {
      throw new ValidationError("Company name is required");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      `
      INSERT INTO companies (
        id,
        name,
        website_url,
        linkedin_url,
        industry,
        size,
        location_text,
        location_lat,
        location_lng,
        notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        id,
        name,
        payload.websiteUrl ?? null,
        payload.linkedinUrl ?? null,
        payload.industry ?? null,
        payload.size ?? null,
        parseResult.data.locationText ?? null,
        parseResult.data.locationLat ?? null,
        parseResult.data.locationLng ?? null,
        payload.notes ?? null,
      ],
    );

    await syncTagIdsForEntity(this.db, "company", id, payload.tagIds);

    return id;
  }

  async update(payload: CompanyUpdatePayload): Promise<void> {
    await this.db.execute(
      `
      UPDATE companies
      SET
        name = COALESCE($1, name),
        website_url = COALESCE($2, website_url),
        linkedin_url = COALESCE($3, linkedin_url),
        industry = COALESCE($4, industry),
        size = COALESCE($5, size),
        location_text = COALESCE($6, location_text),
        location_lat = COALESCE($7, location_lat),
        location_lng = COALESCE($8, location_lng),
        notes = COALESCE($9, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      `,
      [
        payload.name ?? null,
        payload.websiteUrl ?? null,
        payload.linkedinUrl ?? null,
        payload.industry ?? null,
        payload.size ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
        payload.notes ?? null,
        payload.id,
      ],
    );

    if (payload.tagIds !== undefined) {
      await syncTagIdsForEntity(this.db, "company", payload.id, payload.tagIds);
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM companies WHERE id = $1", [id]);
  }

  async listAssociatedContacts(
    companyId: string,
  ): Promise<CompanyAssociatedContact[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         id,
         full_name,
         email,
         phone,
         type
       FROM contacts
       WHERE company_id = $1
       ORDER BY updated_at DESC`,
      [companyId],
    );

    return rows.map((row) => ({
      id: String(row.id),
      fullName: typeof row.full_name === "string" ? row.full_name : "",
      email: (row.email as string | null) ?? null,
      phone: (row.phone as string | null) ?? null,
      type: typeof row.type === "string" ? row.type : "company",
    }));
  }

  async listAssociatedApplications(
    companyId: string,
  ): Promise<CompanyAssociatedApplication[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         applications.id,
         applications.title,
         CASE
           WHEN latest_event.type = 'Decision/Rejected' THEN 'rejected'
           WHEN latest_event.type = 'Decision/Accepted' THEN 'offer'
           WHEN latest_event.type LIKE 'Offer/%' THEN 'offer'
           WHEN latest_event.type LIKE 'Negotiation/%' THEN 'offer'
           WHEN latest_event.type LIKE 'Post-Offer/%' THEN 'offer'
           WHEN latest_event.type = 'Interview/Technical Interview' THEN 'technical'
           WHEN latest_event.type LIKE 'Interview/%' THEN 'interview'
           WHEN latest_event.type LIKE 'Assessment/%' THEN 'interview'
           WHEN latest_event.type = 'Screening/Phone Screen' THEN 'phone-screening'
           WHEN latest_event.type LIKE 'Screening/%' THEN 'applied'
           WHEN latest_event.type = 'Application/Saved' THEN 'saved'
           WHEN latest_event.type LIKE 'Application/%' THEN 'applied'
           ELSE 'saved'
         END AS status,
         applications.applied_at
       FROM applications
       LEFT JOIN (
         SELECT
           ae.application_id,
           e.type,
           ROW_NUMBER() OVER (
             PARTITION BY ae.application_id
             ORDER BY ae.sort_order DESC
           ) AS rn
         FROM application_events ae
         INNER JOIN events e ON e.id = ae.event_id
         WHERE ae.event_at IS NOT NULL
       ) latest_event
         ON latest_event.application_id = applications.id
        AND latest_event.rn = 1
       WHERE applications.company_id = $1
         AND applications.deleted_at IS NULL
       ORDER BY applications.applied_at DESC, applications.updated_at DESC`,
      [companyId],
    );

    return rows.map((row) => ({
      id: String(row.id),
      title: typeof row.title === "string" ? row.title : "",
      status: typeof row.status === "string" ? row.status : "saved",
      appliedAt: typeof row.applied_at === "string" ? row.applied_at : null,
    }));
  }
}
