import { faker } from "@faker-js/faker";

export interface ApplicationEventRow {
  id: string;
  application_id: string;
  event_type: string;
  event_at: string;
  title: string | null;
  description: string | null;
  contact_id: string | null;
  attachment_path: string | null;
  reminder_at: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
}

const EVENT_TYPES = [
  "application_submitted",
  "email_received",
  "recruiter_call",
  "interview_scheduled",
  "technical_test_assigned",
  "technical_test_submitted",
  "feedback_received",
  "follow_up_sent",
  "offer_received",
  "rejection_received",
  "status_changed",
  "note_added",
  "document_uploaded",
] as const;

export function createApplicationEventRow(
  applicationId: string,
  index: number,
  contactId: string | null,
  seed = 1900,
): ApplicationEventRow {
  faker.seed(seed + index);
  const eventAt = faker.date.recent({ days: 120 }).toISOString();

  return {
    id: faker.string.uuid(),
    application_id: applicationId,
    event_type: faker.helpers.arrayElement(EVENT_TYPES),
    event_at: eventAt,
    title:
      faker.helpers.maybe(() => faker.lorem.words(4), { probability: 0.9 }) ??
      null,
    description:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.8 }) ??
      null,
    contact_id: contactId,
    attachment_path:
      faker.helpers.maybe(
        () =>
          `/attachments/event-${faker.number.int({ min: 1000, max: 9999 })}.txt`,
        { probability: 0.25 },
      ) ?? null,
    reminder_at:
      faker.helpers.maybe(() => faker.date.soon({ days: 14 }).toISOString(), {
        probability: 0.35,
      }) ?? null,
    outcome:
      faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.5 }) ??
      null,
    created_at: eventAt,
    updated_at: eventAt,
  };
}

export function createApplicationEventRows(
  applicationIds: string[],
  contactIds: string[],
  eventsPerApplication = 3,
  seed = 1900,
): ApplicationEventRow[] {
  return applicationIds.flatMap((applicationId, appIndex) =>
    Array.from({ length: eventsPerApplication }, (_, eventIndex) => {
      const index = appIndex * eventsPerApplication + eventIndex;
      return createApplicationEventRow(
        applicationId,
        index,
        contactIds[index % contactIds.length] ?? null,
        seed,
      );
    }),
  );
}
