import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Company } from "@modules/companies/domain/entities/Company";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";
import { COMPANY_SEARCH_FIELDS } from "@modules/companies/constants/companyDatatableFields";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

export interface CompanyCreatePayload {
  name: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  notes?: string | null;
}

export interface CompanyUpdatePayload {
  id: string;
  name?: string;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  notes?: string | null;
}

export interface ICompanyRepository extends IRepository<
  Company,
  CompanyCreatePayload,
  CompanyUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Company>>;
}

export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Company[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "companies",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );

    return rows.map((row) => mapCompanyRowToEntity(row));
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
      items: listRows.map((row) => mapCompanyRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: CompanyCreatePayload): Promise<string> {
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
        payload.name,
        payload.websiteUrl ?? null,
        payload.linkedinUrl ?? null,
        payload.industry ?? null,
        payload.size ?? null,
        payload.locationText ?? null,
        payload.locationLat ?? null,
        payload.locationLng ?? null,
        payload.notes ?? null,
      ],
    );
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
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM companies WHERE id = $1", [id]);
  }
}
