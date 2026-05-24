import type { ApplicationBasePayload } from "@modules/applications/types/payloads";
import type { InteractionStage } from "@modules/events/presentation/constants/interactionStages";

import {
  ApplicationEventFlowStatus,
  ApplicationStatus,
} from "@modules/applications/types/enums";

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
 * Draft flow step payload used when creating an application.
 */
export interface ApplicationDraftFlowStep {
  type: InteractionStage;
  eventAt: Date | null;
}

/**
 * Submission payload emitted by application forms.
 */
export type ApplicationFormSubmitPayload = Omit<
  ApplicationBasePayload,
  "id"
> & {
  flowSteps?: ApplicationDraftFlowStep[];
};

/**
 * Build the default empty application form values.
 */
export function createEmptyApplicationFormValues(): ApplicationFormValues {
  return {
    companyId: null,
    title: "",
    status: ApplicationStatus.Saved,
    eventFlowStatus: ApplicationEventFlowStatus.Applied,
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
