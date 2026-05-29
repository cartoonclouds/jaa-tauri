/** Canonical ordered list of supported interaction stage values. */
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

/** Default stage used when no explicit stage value is provided. */
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

/**
 * Defines event stage copy.
 */
export interface EventStageCopy {
  title: string;
  description: string;
}

/**
 * Type alias for event notification severity.
 */
export type EventNotificationSeverity =
  | "info"
  | "warning"
  | "success"
  | "error";

/**
 * Canonical set of event flow stages available for applications.
 */
export const EVENT_FLOW_STAGE_SET: ReadonlySet<InteractionStage> = new Set(
  INTERACTION_STAGES,
);

export const EVENT_COPY_BY_STAGE: Record<InteractionStage, EventStageCopy> = {
  "Application/Saved": {
    title: "Application saved",
    description:
      "Captured the opportunity and added it to the application pipeline.",
  },
  "Application/Submitted": {
    title: "Application submitted",
    description:
      "Submitted the application package and started the review flow.",
  },
  "Screening/Recruiter Outreach": {
    title: "Recruiter reached out",
    description: "A recruiter initiated contact to discuss the role and fit.",
  },
  "Screening/Phone Screen": {
    title: "Phone screen completed",
    description:
      "Completed an initial screening conversation about experience and expectations.",
  },
  "Screening/Hiring Manager Review": {
    title: "Hiring manager review",
    description:
      "The hiring manager reviewed the profile before moving to interviews.",
  },
  "Interview/Technical Interview": {
    title: "Technical interview",
    description:
      "Advanced into a technical interview focused on implementation and problem solving.",
  },
  "Interview/Panel Interview": {
    title: "Panel interview",
    description:
      "Met multiple stakeholders to discuss experience, collaboration, and fit.",
  },
  "Interview/Final Round": {
    title: "Final interview round",
    description:
      "Completed the final stage of interviews with the company team.",
  },
  "Assessment/Take-home Assignment": {
    title: "Take-home assignment",
    description:
      "Received a take-home assessment as part of the hiring process.",
  },
  "Assessment/Live Coding": {
    title: "Live coding session",
    description:
      "Worked through a live coding exercise during the interview process.",
  },
  "Offer/Verbal Offer": {
    title: "Verbal offer received",
    description: "Received an initial verbal offer from the employer.",
  },
  "Offer/Written Offer": {
    title: "Written offer received",
    description: "Received the formal written offer and reviewed the terms.",
  },
  "Negotiation/Compensation Negotiation": {
    title: "Compensation negotiation",
    description:
      "Discussed compensation details, benefits, and offer adjustments.",
  },
  "Decision/Accepted": {
    title: "Offer accepted",
    description: "Accepted the offer and confirmed the next onboarding steps.",
  },
  "Decision/Rejected": {
    title: "Application closed",
    description:
      "The process concluded without moving forward to an offer acceptance.",
  },
  "Post-Offer/Background Check": {
    title: "Background check",
    description:
      "The employer started post-offer verification and compliance steps.",
  },
  "Post-Offer/Onboarding": {
    title: "Onboarding started",
    description:
      "Began onboarding and handoff activities after accepting the role.",
  },
  "Networking/Follow-up": {
    title: "Follow-up sent",
    description:
      "Sent a follow-up to keep the conversation active and maintain momentum.",
  },
};

export const EVENT_NOTIFICATION_SEVERITY_BY_STAGE: Record<
  InteractionStage,
  EventNotificationSeverity
> = {
  "Application/Saved": "info",
  "Application/Submitted": "info",
  "Screening/Recruiter Outreach": "info",
  "Screening/Phone Screen": "info",
  "Screening/Hiring Manager Review": "info",
  "Interview/Technical Interview": "info",
  "Interview/Panel Interview": "info",
  "Interview/Final Round": "info",
  "Assessment/Take-home Assignment": "warning",
  "Assessment/Live Coding": "warning",
  "Offer/Verbal Offer": "success",
  "Offer/Written Offer": "success",
  "Negotiation/Compensation Negotiation": "warning",
  "Decision/Accepted": "success",
  "Decision/Rejected": "error",
  "Post-Offer/Background Check": "success",
  "Post-Offer/Onboarding": "success",
  "Networking/Follow-up": "info",
};

export const EVENT_NOTIFICATION_SEVERITY_BY_PREFIX: {
  prefix: InteractionStagePrefix;
  severity: EventNotificationSeverity;
}[] = [
  {
    prefix: "Offer/",
    severity: "success",
  },
  {
    prefix: "Post-Offer/",
    severity: "success",
  },
  {
    prefix: "Assessment/",
    severity: "warning",
  },
];

export const EVENT_NOTIFICATION_BODY_PREFIX = "Flow update" as const;
