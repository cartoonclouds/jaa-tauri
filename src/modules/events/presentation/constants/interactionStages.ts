import {
  INTERACTION_STAGES,
  type InteractionStage,
  type InteractionStagePrefix,
  isInteractionStage,
} from "@modules/events/domain/constants/interactionStage";

export { INTERACTION_STAGES, isInteractionStage };
export type { InteractionStage, InteractionStagePrefix };

export type ApplicationFlowStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export type ApplicationProgressStatus =
  | "saved"
  | "applied"
  | "phone-screening"
  | "technical"
  | "interview"
  | "offer"
  | "rejected";

export interface EventStageCopy {
  title: string;
  description: string;
}

export type EventNotificationSeverity =
  | "info"
  | "warning"
  | "success"
  | "error";

export const EVENT_FLOW_BY_APPLICATION_STATUS: Record<
  ApplicationFlowStatus,
  InteractionStage[]
> = {
  saved: ["Application/Saved"],
  applied: ["Application/Saved", "Application/Submitted"],
  interview: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Phone Screen",
    "Interview/Technical Interview",
  ],
  offer: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Hiring Manager Review",
    "Interview/Final Round",
    "Offer/Written Offer",
  ],
  rejected: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Phone Screen",
    "Decision/Rejected",
  ],
};

export const FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS: Record<
  ApplicationProgressStatus,
  InteractionStage[]
> = {
  saved: [
    "Screening/Phone Screen",
    "Interview/Technical Interview",
    "Offer/Written Offer",
    "Decision/Accepted",
    "Post-Offer/Onboarding",
  ],
  applied: [
    "Screening/Phone Screen",
    "Interview/Technical Interview",
    "Offer/Written Offer",
    "Decision/Accepted",
    "Post-Offer/Onboarding",
  ],
  "phone-screening": [
    "Interview/Technical Interview",
    "Offer/Written Offer",
    "Decision/Accepted",
    "Post-Offer/Onboarding",
  ],
  technical: [
    "Interview/Final Round",
    "Offer/Written Offer",
    "Decision/Accepted",
    "Post-Offer/Onboarding",
  ],
  interview: [
    "Offer/Written Offer",
    "Decision/Accepted",
    "Post-Offer/Onboarding",
  ],
  offer: ["Decision/Accepted", "Post-Offer/Onboarding"],
  rejected: [],
};

export function isApplicationProgressStatus(
  value: string | null | undefined,
): value is ApplicationProgressStatus {
  if (!value) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
    FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS,
    value,
  );
}

export function getFutureEventFlowStages(
  status: ApplicationProgressStatus | null | undefined,
): InteractionStage[] {
  if (!status) {
    return [];
  }

  return FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS[status];
}

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
