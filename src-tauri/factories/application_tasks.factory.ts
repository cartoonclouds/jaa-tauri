import { faker } from "@faker-js/faker";

export interface ApplicationTaskRow {
  id: string;
  application_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  reminder_at: string | null;
  priority: number;
  completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function createApplicationTaskRow(
  applicationId: string,
  index: number,
  seed = 2000,
): ApplicationTaskRow {
  faker.seed(seed + index);

  const completed = faker.helpers.arrayElement([0, 1]);
  const createdAt = faker.date.recent({ days: 90 }).toISOString();

  return {
    id: faker.string.uuid(),
    application_id: applicationId,
    title: faker.helpers.arrayElement([
      "Follow up with recruiter",
      "Prepare interview answers",
      "Submit technical exercise",
      "Research company",
      "Send thank-you email",
    ]),
    description:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.8 }) ??
      null,
    due_at:
      faker.helpers.maybe(() => faker.date.soon({ days: 21 }).toISOString(), {
        probability: 0.9,
      }) ?? null,
    reminder_at:
      faker.helpers.maybe(() => faker.date.soon({ days: 14 }).toISOString(), {
        probability: 0.6,
      }) ?? null,
    priority: faker.number.int({ min: 1, max: 5 }),
    completed,
    completed_at:
      completed === 1 ? faker.date.recent({ days: 30 }).toISOString() : null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createApplicationTaskRows(
  applicationIds: string[],
  tasksPerApplication = 2,
  seed = 2000,
): ApplicationTaskRow[] {
  return applicationIds.flatMap((applicationId, appIndex) =>
    Array.from({ length: tasksPerApplication }, (_, taskIndex) => {
      const index = appIndex * tasksPerApplication + taskIndex;
      return createApplicationTaskRow(applicationId, index, seed);
    }),
  );
}
