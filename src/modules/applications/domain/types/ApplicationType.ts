import type { ApplicationStatus } from "../entities/Application";

export interface ApplicationRow {
  id: string;
  company_id: string | null;
  company_name_snapshot: string;
  job_title: string;
  status: ApplicationStatus;
  applied_at: string | null;
  source_id: string | null;
  source_platform: string | null;
  job_advert_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  contract_type: string | null;
  location_text: string | null;
  work_mode: "remote" | "hybrid" | "onsite" | "unknown";
  priority: number;
  notes: string | null;
  is_archived: number;
  is_deleted: number;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  companyId?: string | null;
  companyNameSnapshot: string;
  jobTitle: string;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  sourceId?: string | null;
  sourcePlatform?: string | null;
  jobAdvertUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  contractType?: string | null;
  locationText?: string | null;
  workMode?: "remote" | "hybrid" | "onsite" | "unknown";
  priority?: number;
  notes?: string | null;
}

export interface UpdateApplicationInput {
  id: string;
  companyId?: string | null;
  companyNameSnapshot?: string;
  jobTitle?: string;
  status?: ApplicationStatus;
  appliedAt?: string | null;
  sourceId?: string | null;
  sourcePlatform?: string | null;
  jobAdvertUrl?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  contractType?: string | null;
  locationText?: string | null;
  workMode?: "remote" | "hybrid" | "onsite" | "unknown";
  priority?: number;
  notes?: string | null;
  isArchived?: boolean;
  isDeleted?: boolean;
  closedAt?: string | null;
}
