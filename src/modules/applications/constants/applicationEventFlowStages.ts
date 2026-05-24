import type { InteractionStage } from "@modules/events/presentation/constants/interactionStages";

import { ApplicationEventFlowStatus } from "@modules/applications/types/enums";

/**
 * Maps each application event-flow status to the required default interaction stages.
 */
export const APPLICATION_FLOW_STAGES_BY_STATUS: Record<
  string,
  InteractionStage[]
> = {
  [ApplicationEventFlowStatus.Saved.value]: ["Application/Saved"],
  [ApplicationEventFlowStatus.Applied.value]: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Recruiter Outreach",
    "Screening/Phone Screen",
  ],
  [ApplicationEventFlowStatus.Interview.value]: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Recruiter Outreach",
    "Screening/Phone Screen",
    "Screening/Hiring Manager Review",
    "Interview/Technical Interview",
    "Interview/Panel Interview",
  ],
  [ApplicationEventFlowStatus.Offer.value]: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Recruiter Outreach",
    "Screening/Phone Screen",
    "Screening/Hiring Manager Review",
    "Interview/Technical Interview",
    "Interview/Panel Interview",
    "Interview/Final Round",
    "Assessment/Take-home Assignment",
    "Offer/Written Offer",
    "Negotiation/Compensation Negotiation",
  ],
  [ApplicationEventFlowStatus.Rejected.value]: [
    "Application/Saved",
    "Application/Submitted",
    "Screening/Recruiter Outreach",
    "Screening/Phone Screen",
    "Interview/Technical Interview",
    "Decision/Rejected",
  ],
};
