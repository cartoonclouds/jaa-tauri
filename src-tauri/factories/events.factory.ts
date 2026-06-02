import type {
  EventStageCopy,
  InteractionStage,
} from "../../src/modules/events/constants";

import { faker } from "@faker-js/faker";

import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_STAGE_SET,
} from "../../src/modules/events/constants";

export interface EventRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationEventRow {
  application_id: string;
  event_id: string;
  event_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface EventApplicationInput {
  id: string;
  company_id: string;
}

const STATUS_TO_COMPLETED_STAGE_COUNT: Record<string, number> = {
  saved: 1,
  applied: 4,
  "phone-screening": 5,
  technical: 6,
  interview: 8,
  offer: 11,
  rejected: 6,
};

function splitStagesByStatus(status: string): {
  completedStages: InteractionStage[];
} {
  const flowStages = [...EVENT_FLOW_STAGE_SET];
  const completedCount =
    STATUS_TO_COMPLETED_STAGE_COUNT[status] ??
    STATUS_TO_COMPLETED_STAGE_COUNT.applied;
  const normalizedCompletedCount = Math.min(
    Math.max(completedCount, 1),
    flowStages.length,
  );

  const completedStages = flowStages.slice(0, normalizedCompletedCount);

  if (status === "rejected") {
    const rejectedWithDecision = completedStages.filter(
      (stage) => stage !== "Decision/Accepted",
    );
    if (!rejectedWithDecision.includes("Decision/Rejected")) {
      rejectedWithDecision.push("Decision/Rejected");
    }

    return {
      completedStages: rejectedWithDecision,
    };
  }

  return {
    completedStages,
  };
}

export function createEventRows(seed = 1500): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return [...EVENT_FLOW_STAGE_SET].map((type, index) => {
    faker.seed(seed + index);
    const anchorDate = faker.date.recent({ days: 60 });
    const createdAt = new Date(anchorDate);
    const stageCopy: EventStageCopy = EVENT_COPY_BY_STAGE[type];

    return {
      id: faker.string.uuid(),
      type,
      title: stageCopy.title,
      description: stageCopy.description,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  });
}

export function createApplicationEventRows(
  applications: EventApplicationInput[],
  events: EventRow[],
  _eventsPerApplication = 2,
  seed = 1501,
): ApplicationEventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const eventIdByStage = new Map(
    events.map((eventRow) => [eventRow.type, eventRow.id]),
  );

  return applications.flatMap((application, applicationIndex) => {
    const lifecycleStatuses: string[] = [
      "saved",
      "applied",
      "phone-screening",
      "technical",
      "interview",
      "offer",
      "rejected",
    ];
    const seededStatus =
      lifecycleStatuses[applicationIndex % lifecycleStatuses.length] ??
      "applied";
    const { completedStages } = splitStagesByStatus(seededStatus);
    const baseDate = faker.date.recent({ days: 60 });
    const baseTime = baseDate.getTime();

    return [...EVENT_FLOW_STAGE_SET].map((stage, stageIndex) => {
      const stageEventAt = completedStages.includes(stage)
        ? new Date(baseTime + stageIndex * 3600_000).toISOString()
        : null;
      const eventId = eventIdByStage.get(stage);

      if (!eventId) {
        throw new Error(`Missing canonical event row for stage: ${stage}`);
      }

      return {
        application_id: application.id,
        event_id: eventId,
        event_at: stageEventAt,
        notes: faker.lorem.sentence(),
        sort_order: stageIndex + 1,
        created_at: new Date(baseTime).toISOString(),
      };
    });
  });
}
