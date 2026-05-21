import type { ApplicationUpdatePayload } from "@modules/applications/types/payloads";

export type ApplicationDrawerMode = "create" | "view" | "edit";

export interface ApplicationSelectOption {
  label: string;
  value: string;
}

export interface ApplicationFormValues {
  companyId: string | null;
  title: string;
  status: string;
  sourceUrl: string;
  appliedAt: string;
  locationText: string;
  locationLat: number | null;
  locationLng: number | null;
  attendanceType: ApplicationUpdatePayload["attendanceType"];
  employmentType: ApplicationUpdatePayload["employmentType"];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  description: string;
  interviewProcess: string;
  benefits: string;
  priority: number;
  isArchived: boolean;
}

export type ApplicationFormSubmitPayload = Omit<ApplicationUpdatePayload, "id">;

export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    companyId: null,
    title: "",
    status: "saved",
    sourceUrl: "",
    appliedAt: "",
    locationText: "",
    locationLat: null,
    locationLng: null,
    attendanceType: null,
    employmentType: null,
    salaryMin: null,
    salaryMax: null,
    currency: "",
    description: "",
    interviewProcess: "",
    benefits: "",
    priority: 3,
    isArchived: false,
  };
}
