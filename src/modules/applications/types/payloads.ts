// Unified base type for application payloads and form values
import {
  type ApplicationAttendanceType,
  type ApplicationEmploymentType,
} from "./enums";

export interface ApplicationBasePayload {
  companyId: string | null;
  title: string; // required
  status: string; // required
  sourceUrl?: string | null;
  appliedAt?: string | null;
  locationText?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  attendanceType?: ApplicationAttendanceType | null;
  employmentType?: ApplicationEmploymentType | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  description?: string | null;
  interviewProcess?: string | null;
  benefits?: string | null;
  priority: number; // required
  isArchived: boolean; // required
}

export type ApplicationMutationPayload = ApplicationBasePayload;
export type ApplicationFormValues = ApplicationBasePayload;
export type ApplicationFormSubmitPayload = Omit<ApplicationUpdatePayload, "id">;

export type ApplicationUpdatePayload = ApplicationBasePayload & {
  id: string;
};

export type ApplicationCreatePayload = {
  title: string;
} & Partial<
  Omit<ApplicationBasePayload, "title" | "priority" | "isArchived" | "status">
> & {
    priority?: number;
    isArchived?: boolean;
    status?: string;
  };
