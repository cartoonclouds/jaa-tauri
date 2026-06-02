import type { ApplicationBasePayload } from "@modules/applications/types/payloads";
import type { InteractionStage } from "@modules/events/constants";

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
  sortOrder: number;
}

/**
 * Submission payload emitted by application forms.
 */
export type ApplicationFormSubmitPayload = Omit<
  ApplicationBasePayload,
  "id"
> & {
  flowSteps?: ApplicationDraftFlowStep[];
  pendingTagNames?: string[];
};
