import { faker } from "@faker-js/faker";

export interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  completed: number;
  created_at: string;
  updated_at: string;
}

export function createTaskRow(
  projectId: string,
  index: number,
  seed = 1200,
): TaskRow {
  faker.seed(seed + index);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  const createdAt = faker.date.recent({ days: 60 }).toISOString();

  return {
    id: faker.string.uuid(),
    project_id: projectId,
    title: faker.hacker.phrase(),
    completed: faker.helpers.arrayElement([0, 1]),
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createTaskRows(
  projectIds: string[],
  tasksPerProject = 3,
  seed = 1200,
): TaskRow[] {
  return projectIds.flatMap((projectId, projectIndex) =>
    Array.from({ length: tasksPerProject }, (_, taskIndex) => {
      const index = projectIndex * tasksPerProject + taskIndex;
      return createTaskRow(projectId, index, seed);
    }),
  );
}
