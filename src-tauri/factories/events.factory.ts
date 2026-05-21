import type { ApplicationFlowStatus } from "../../src/modules/events/presentation/constants/interactionStages";

import { faker } from "@faker-js/faker";

import {
  EVENT_COPY_BY_STAGE,
  EVENT_FLOW_BY_APPLICATION_STATUS,
} from "../../src/modules/events/presentation/constants/interactionStages";

export interface EventRow {
  id: string;
  application_id: string;
  contact_id: string | null;
  type: string;
  title: string;
  description: string;
  event_at: string;
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

function getEventFlowStages(
  status: string,
  eventsPerApplication: number,
): string[] {
  const resolvedStatus =
    status in EVENT_FLOW_BY_APPLICATION_STATUS
      ? (status as ApplicationFlowStatus)
      : "applied";
  const flowStages = EVENT_FLOW_BY_APPLICATION_STATUS[resolvedStatus];

  if (eventsPerApplication >= flowStages.length) {
    return flowStages;
  }

  if (eventsPerApplication <= 1) {
    return [flowStages[flowStages.length - 1] ?? "Application/Submitted"];
  }

  const selectedStages: string[] = [];

  for (let index = 0; index < eventsPerApplication; index += 1) {
    const position = Math.round(
      (index * (flowStages.length - 1)) / (eventsPerApplication - 1),
    );
    const stage = flowStages[position];

    if (stage && !selectedStages.includes(stage)) {
      selectedStages.push(stage);
    }
  }

  return selectedStages;
}

function getFallbackStageTitle(type: string): string {
  const segments = type.split("/");
  const lastSegment = segments[segments.length - 1];

  return lastSegment && lastSegment.length > 0
    ? lastSegment
    : "Application update";
}

function getRejectedEventTitle(): string {
  const rejectedTitles = ["Application rejected", "Process ended after review"];

  return faker.helpers.arrayElement(rejectedTitles);
}

export function createEventRows(
  applications: EventApplicationInput[],
  contacts: EventContactInput[],
  eventsPerApplication = 2,
  seed = 1500,
): EventRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applications.flatMap((application, applicationIndex) =>
    getEventFlowStages(application.status, eventsPerApplication).map(
      (type, index, flowStages) => {
        faker.seed(seed + applicationIndex * 100 + index);
        const anchorDate = faker.date.recent({ days: 60 });
        const createdAt = new Date(anchorDate);
        const eventAt = new Date(anchorDate);
        const companyContacts = contacts.filter(
          (contact) => contact.company_id === application.company_id,
        );
        const stageCopy = EVENT_COPY_BY_STAGE[type] ?? {
          title: getFallbackStageTitle(type),
          description: "Recorded a new application flow milestone.",
        };

        eventAt.setDate(
          eventAt.getDate() + index * faker.number.int({ min: 2, max: 6 }),
        );

        return {
          id: faker.string.uuid(),
          application_id: application.id,
          contact_id:
            companyContacts.length > 0 && type !== "Application/Saved"
              ? faker.helpers.arrayElement(companyContacts).id
              : null,
          type,
          title:
            index === flowStages.length - 1 && type === "Decision/Rejected"
              ? getRejectedEventTitle()
              : stageCopy.title,
          description: stageCopy.description,
          event_at: eventAt.toISOString(),
          created_at: createdAt.toISOString(),
          updated_at: createdAt.toISOString(),
        };
      },
    ),
  );
}
