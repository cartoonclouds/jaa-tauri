import type { ApplicationBasePayload } from "@modules/applications/types/payloads";

import { ApplicationStatus } from "@modules/applications/types/enums";

/**
 * Drawer state used by the application presentation layer.
 */
export type ApplicationDrawerMode = "create" | "view" | "edit";

/**
 * Lightweight select option used in application forms.
 */
export interface ApplicationSelectOption<TValue = string> {
  /** Display label shown to the user. */
  label: string;
  /** Underlying value submitted by the control. */
  value: TValue;
}

/**
 * Form values used by the application presentation layer.
 */
export type ApplicationFormValues = ApplicationBasePayload;
/**
 * Submission payload emitted by application forms.
 */
export type ApplicationFormSubmitPayload = Omit<ApplicationBasePayload, "id">;

/**
 * Build the default empty application form values.
 */
export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    companyId: null,
    title: "",
    status: ApplicationStatus.Saved,
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
