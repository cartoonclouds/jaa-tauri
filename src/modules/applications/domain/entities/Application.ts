export type ApplicationStatus =
  | "saved"
  | "applied"
  | "recruiter_contacted"
  | "screening"
  | "technical_test"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "accepted"
  | "ghosted";

export interface Application {
  id: string;
  companyId: string | null;
  companyNameSnapshot: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string | null;
  sourceId: string | null;
  sourcePlatform: string | null;
  jobAdvertUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  contractType: string | null;
  locationText: string | null;
  workMode: "remote" | "hybrid" | "onsite" | "unknown";
  priority: number;
  notes: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
