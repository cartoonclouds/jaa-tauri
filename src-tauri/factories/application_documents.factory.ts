import { faker } from "@faker-js/faker";

export interface ApplicationDocumentRow {
  application_id: string;
  document_id: string;
  relation_type: string;
  created_at: string;
}

export function createApplicationDocumentRows(
  applicationIds: string[],
  documentIds: string[],
  docsPerApplication = 2,
  seed = 2000,
): ApplicationDocumentRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applicationIds.flatMap((applicationId, applicationIndex) =>
    Array.from({ length: docsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);

      return {
        application_id: applicationId,
        document_id: documentIds[(applicationIndex + index) % documentIds.length],
        relation_type: faker.helpers.arrayElement(["attachment", "cv", "cover-letter"]),
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
