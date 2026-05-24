import type {
  ApplicationFlowStatus,
  ApplicationProgressStatus,
  EventStageCopy,
  InteractionStage,
} from "../../src/modules/events/presentation/constants/interactionStages";

import { faker } from "@faker-js/faker";

import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_BY_APPLICATION_STATUS,
  FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS,
} from "../../src/modules/events/presentation/constants/interactionStages";

export interface EventRow {
  id: string;
  application_id: string;
  contact_id: string | null;
  type: string;
  title: string;
  description: string;
  event_at: string | null;
  created_at: string;
  updated_at: string;
}

interface EventApplicationInput {
  id: string;
  company_id: string;
  status: string;
}

interface EventContactInput {
  id: string;
  company_id: string;
}

function getCompletedStages(status: string): InteractionStage[] {
  const resolvedStatus =
    status in EVENT_FLOW_BY_APPLICATION_STATUS
      ? (status as ApplicationFlowStatus)
      : "applied";

  return EVENT_FLOW_BY_APPLICATION_STATUS[resolvedStatus];
}

function getFutureStages(status: string): InteractionStage[] {
  if (
    !Object.prototype.hasOwnProperty.call(
      FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS,
      status,
    )
  ) {
    return [];
  }

  return FUTURE_EVENT_FLOW_BY_PROGRESS_STATUS[
    status as ApplicationProgressStatus
  ];
}

function getRejectedEventTitle(): string {
  const rejectedTitles = ["Application rejected", "Process ended after review"];

  return faker.helpers.arrayElement(rejectedTitles);
}

export function createEventRows(
  applications: EventApplicationInput[],
  contacts: EventContactInput[],
  _eventsPerApplication = 2,
  seed = 1500,
): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applications.flatMap((application, applicationIndex) => {
    const completedStages = getCompletedStages(application.status);
    const futureStages = getFutureStages(application.status);
    const flowStages = [
      ...completedStages,
      ...futureStages.filter((stage) => !completedStages.includes(stage)),
    ];

    return flowStages.map((type, index) => {
      faker.seed(seed + applicationIndex * 100 + index);
      const anchorDate = faker.date.recent({ days: 60 });
      const createdAt = new Date(anchorDate);
      const eventAt = new Date(anchorDate);
      const companyContacts = contacts.filter(
        (contact) => contact.company_id === application.company_id,
      );
      const stageCopy: EventStageCopy = EVENT_COPY_BY_STAGE[type];
      const isCompletedStage = completedStages.includes(type);

      eventAt.setDate(
        eventAt.getDate() + index * faker.number.int({ min: 2, max: 6 }),
      );

      return {
        id: faker.string.uuid(),
        application_id: application.id,
        contact_id:
          isCompletedStage &&
          companyContacts.length > 0 &&
          type !== "Application/Saved"
            ? faker.helpers.arrayElement(companyContacts).id
            : null,
        type,
        title:
          isCompletedStage &&
          type === "Decision/Rejected" &&
          completedStages[completedStages.length - 1] === type
            ? getRejectedEventTitle()
            : stageCopy.title,
        description: stageCopy.description,
        event_at: isCompletedStage ? eventAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      };
    });
  });
}
