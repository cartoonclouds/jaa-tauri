import type { Application } from "@modules/applications/domain/entities/Application";
import type { ApplicationRow } from "@modules/applications/domain/types/ApplicationType";

export function mapApplicationRow(row: ApplicationRow): Application {
  return {
    id: row.id,
    companyId: row.company_id,
    companyNameSnapshot: row.company_name_snapshot,
    jobTitle: row.job_title,
    status: row.status,
    appliedAt: row.applied_at,
    sourceId: row.source_id,
    sourcePlatform: row.source_platform,
    jobAdvertUrl: row.job_advert_url,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    contractType: row.contract_type,
    locationText: row.location_text,
    workMode: row.work_mode,
    priority: row.priority,
    notes: row.notes,
    isArchived: row.is_archived === 1,
    isDeleted: row.is_deleted === 1,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
