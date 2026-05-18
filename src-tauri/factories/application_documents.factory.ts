import { faker } from "@faker-js/faker";

export interface ApplicationDocumentRow {
  application_id: string;
  document_id: string;
  note: string | null;
  created_at: string;
}

export function createApplicationDocumentRows(
  applicationIds: string[],
  documentIds: string[],
  linksPerApplication = 2,
  seed = 2200,
): ApplicationDocumentRow[] {
  const rows: ApplicationDocumentRow[] = [];

  applicationIds.forEach((applicationId, appIndex) => {
    for (let i = 0; i < linksPerApplication; i += 1) {
      const index = appIndex * linksPerApplication + i;
      faker.seed(seed + index);

      rows.push({
        application_id: applicationId,
        document_id: documentIds[index % documentIds.length] ?? documentIds[0],
        note:
          faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.5,
          }) ?? null,
        created_at: faker.date.recent({ days: 40 }).toISOString(),
      });
    }
  });

  return rows;
}
