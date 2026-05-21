import type { EventNotificationSeverity } from "../../src/modules/events/presentation/constants/interactionStages";

import { faker } from "@faker-js/faker";

import {
  EVENT_NOTIFICATION_BODY_PREFIX,
  EVENT_NOTIFICATION_SEVERITY_BY_PREFIX,
  EVENT_NOTIFICATION_SEVERITY_BY_STAGE,
} from "../../src/modules/events/presentation/constants/interactionStages";

export interface NotificationRow {
  id: string;
  application_id: string;
  event_id: string | null;
  severity: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  is_read: number;
  scheduled_for: string;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

interface NotificationApplicationInput {
  id: string;
}

interface NotificationEventInput {
  id: string;
  application_id: string;
  type: string;
  title: string;
}

function getSeverityForEventType(type: string): EventNotificationSeverity {
  const exactMatch = EVENT_NOTIFICATION_SEVERITY_BY_STAGE[type];

  if (exactMatch) {
    return exactMatch;
  }

  for (const rule of EVENT_NOTIFICATION_SEVERITY_BY_PREFIX) {
    if (type.startsWith(rule.prefix)) {
      return rule.severity;
    }
  }

  return "info";
}

export function createNotificationRows(
  applications: NotificationApplicationInput[],
  events: NotificationEventInput[],
  perApplication = 1,
  seed = 1600,
): NotificationRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applications.flatMap((application, applicationIndex) =>
    Array.from({ length: perApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);
      const createdAt = faker.date.recent({ days: 45 }).toISOString();
      const eventForApplication = events.filter(
        (event) => event.application_id === application.id,
      );
      const selectedEvent = eventForApplication.length
        ? faker.helpers.arrayElement(eventForApplication)
        : null;

      return {
        id: faker.string.uuid(),
        application_id: application.id,
        event_id: selectedEvent?.id ?? null,
        severity: selectedEvent
          ? getSeverityForEventType(selectedEvent.type)
          : "info",
        title: selectedEvent ? selectedEvent.title : "Application update",
        body: selectedEvent
          ? `${EVENT_NOTIFICATION_BODY_PREFIX}: ${selectedEvent.type}`
          : faker.lorem.sentence(),
        is_read: faker.helpers.arrayElement([0, 1]),
        scheduled_for: faker.date.soon({ days: 14 }).toISOString(),
        sent_at: faker.date.recent({ days: 14 }).toISOString(),
        created_at: createdAt,
        updated_at: createdAt,
      };
    }),
  );
}
