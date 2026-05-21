import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Company } from "@modules/companies/domain/entities/Company";
import type { IRepository } from "@shared/types";

import { mapCompanyRowToEntity } from "@modules/companies/application/mappers/mapCompanyRow";

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
> {}

export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Company[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM companies ORDER BY created_at DESC",
    );

    return rows.map((row) => mapCompanyRowToEntity(row));
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
