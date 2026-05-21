import type { Application } from "@modules/applications/domain/entities/Application";

export type ApplicationAttendanceType = Application["attendanceType"];

export type ApplicationEmploymentType = Application["employmentType"];

export interface ApplicationMutationPayload {
  companyId: string | null;
  title: string;
  status: string;
  sourceUrl: string | null;
  appliedAt: string | null;
  locationText: string | null;
  locationLat: number | null;
  locationLng: number | null;
  attendanceType: ApplicationAttendanceType;
  employmentType: ApplicationEmploymentType;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  description: string | null;
  interviewProcess: string | null;
  benefits: string | null;
  priority: number;
  isArchived: boolean;
}

export type ApplicationUpdatePayload = ApplicationMutationPayload & {
  id: string;
};

export type ApplicationCreatePayload = {
  title: string;
} & Partial<Omit<ApplicationMutationPayload, "title">>;
