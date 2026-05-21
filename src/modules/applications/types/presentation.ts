import type { ApplicationBasePayload } from "@modules/applications/types/payloads";

export type ApplicationDrawerMode = "create" | "view" | "edit";

export interface ApplicationSelectOption {
  label: string;
  value: string;
}

export type ApplicationFormValues = ApplicationBasePayload;
export type ApplicationFormSubmitPayload = Omit<ApplicationBasePayload, "id">;

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
