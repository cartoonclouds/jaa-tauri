export const INTERACTION_STAGES = [
  "Application/Saved",
  "Application/Submitted",
  "Screening/Recruiter Outreach",
  "Screening/Phone Screen",
  "Screening/Hiring Manager Review",
  "Interview/Technical Interview",
  "Interview/Panel Interview",
  "Interview/Final Round",
  "Assessment/Take-home Assignment",
  "Assessment/Live Coding",
  "Offer/Verbal Offer",
  "Offer/Written Offer",
  "Negotiation/Compensation Negotiation",
  "Decision/Accepted",
  "Decision/Rejected",
  "Post-Offer/Background Check",
  "Post-Offer/Onboarding",
  "Networking/Follow-up",
] as const;

/**
 * Type alias for interaction stage.
 */
export type InteractionStage = (typeof INTERACTION_STAGES)[number];

/**
 * Type alias for stage prefix.
 */
type StagePrefix<T extends string> = T extends `${infer Prefix}/${string}`
  ? `${Prefix}/`
  : never;

/**
 * Type alias for interaction stage prefix.
 */
export type InteractionStagePrefix = StagePrefix<InteractionStage>;

export const DEFAULT_INTERACTION_STAGE: InteractionStage = "Application/Saved";

const INTERACTION_STAGE_SET: ReadonlySet<string> = new Set(INTERACTION_STAGES);

/**
 * Checks whether interaction stage is true.
 */
export function isInteractionStage(
  value: string | null | undefined,
): value is InteractionStage {
  if (!value) {
    return false;
  }

  return INTERACTION_STAGE_SET.has(value);
}

/**
 * Handles to interaction stage.
 */
export function toInteractionStage(
  value: unknown,
  fallback: InteractionStage = DEFAULT_INTERACTION_STAGE,
): InteractionStage {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return isInteractionStage(normalized) ? normalized : fallback;
}








