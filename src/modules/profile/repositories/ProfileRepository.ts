import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Profile } from "@modules/profile/domain/entities/Profile";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapProfileRowToEntity } from "@modules/profile/application/mappers/mapProfileRow";
import { PROFILE_SEARCH_FIELDS } from "@modules/profile/constants/profileDatatableFields";
import { ProfileSchema } from "@modules/profile/domain/zod/profile.schema";
import {
  buildSearchWhereClause,
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";
import { z } from "zod";

export type ProfileCreatePayload = Pick<Profile, "fullName"> &
  Partial<Omit<Profile, "id" | "fullName" | "createdAt" | "updatedAt">>;
export type ProfileUpdatePayload = Partial<ProfileCreatePayload> & {
  id: string;
};

export interface IProfileRepository extends IRepository<
  Profile,
  ProfileCreatePayload,
  ProfileUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Profile>>;
}

const ProfileCreateSchema = ProfileSchema.pick({
  fullName: true,
  email: true,
  phone: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
  headline: true,
  summary: true,
  locationText: true,
  desiredSalary: true,
  salaryCurrency: true,
  preferredLocations: true,
  remotePreference: true,
  skills: true,
  workEligibility: true,
  noticePeriodDays: true,
  interviewAvailability: true,
});

const ProfileUpdateSchema = ProfileCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export class ProfileRepository implements IProfileRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Profile[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "profiles",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
    );
    return rows.map((row) => mapProfileRowToEntity(row));
  }

  async listPage(
    query: DatatablePageQuery,
  ): Promise<DatatablePageResult<Profile>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      PROFILE_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM profiles
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM profiles",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM profiles
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM profiles
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapProfileRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: ProfileCreatePayload): Promise<string> {
    const payloadParse = ProfileCreateSchema.safeParse(payload);
    if (!payloadParse.success) {
      throw new Error(
        "Profile create validation failed: " +
          JSON.stringify(payloadParse.error.format()),
      );
    }

    const validated = payloadParse.data;
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO profiles (id, full_name, email, phone, linkedin_url, github_url, portfolio_url, headline, summary, location_text, desired_salary, salary_currency, preferred_locations, remote_preference, skills, work_eligibility, notice_period_days, interview_availability, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        validated.fullName,
        validated.email ?? null,
        validated.phone ?? null,
        validated.linkedinUrl ?? null,
        validated.githubUrl ?? null,
        validated.portfolioUrl ?? null,
        validated.headline ?? null,
        validated.summary ?? null,
        validated.locationText ?? null,
        validated.desiredSalary ?? null,
        validated.salaryCurrency,
        JSON.stringify(validated.preferredLocations),
        validated.remotePreference,
        JSON.stringify(validated.skills),
        validated.workEligibility,
        validated.noticePeriodDays ?? null,
        validated.interviewAvailability,
      ],
    );
    return id;
  }

  async update(payload: ProfileUpdatePayload): Promise<void> {
    const payloadParse = ProfileUpdateSchema.safeParse(payload);
    if (!payloadParse.success) {
      throw new Error(
        "Profile update validation failed: " +
          JSON.stringify(payloadParse.error.format()),
      );
    }

    const validated = payloadParse.data;
    await this.db.execute(
      `UPDATE profiles
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           linkedin_url = COALESCE($4, linkedin_url),
           github_url = COALESCE($5, github_url),
           portfolio_url = COALESCE($6, portfolio_url),
           headline = COALESCE($7, headline),
           summary = COALESCE($8, summary),
           location_text = COALESCE($9, location_text),
           desired_salary = COALESCE($10, desired_salary),
           salary_currency = COALESCE($11, salary_currency),
           preferred_locations = COALESCE($12, preferred_locations),
           remote_preference = COALESCE($13, remote_preference),
           skills = COALESCE($14, skills),
           work_eligibility = COALESCE($15, work_eligibility),
           notice_period_days = COALESCE($16, notice_period_days),
           interview_availability = COALESCE($17, interview_availability),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $18`,
      [
        validated.fullName ?? null,
        validated.email ?? null,
        validated.phone ?? null,
        validated.linkedinUrl ?? null,
        validated.githubUrl ?? null,
        validated.portfolioUrl ?? null,
        validated.headline ?? null,
        validated.summary ?? null,
        validated.locationText ?? null,
        validated.desiredSalary ?? null,
        validated.salaryCurrency ?? null,
        validated.preferredLocations === undefined
          ? null
          : JSON.stringify(validated.preferredLocations),
        validated.remotePreference ?? null,
        validated.skills === undefined
          ? null
          : JSON.stringify(validated.skills),
        validated.workEligibility ?? null,
        validated.noticePeriodDays ?? null,
        validated.interviewAvailability ?? null,
        validated.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM profiles WHERE id = $1", [id]);
  }
}
