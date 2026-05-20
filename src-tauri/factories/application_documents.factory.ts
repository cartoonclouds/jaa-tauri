import { faker } from "@faker-js/faker";

export interface ApplicationDocumentRow {
  application_id: string;
  document_id: string;
  relation_type: string;
  created_at: string;
}

interface ApplicationDocumentInput {
  id: string;
  kind: string;
}

export function createApplicationDocumentRows(
  applicationIds: string[],
  documents: ApplicationDocumentInput[],
  docsPerApplication = 2,
  seed = 2000,
): ApplicationDocumentRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return applicationIds.flatMap((applicationId, applicationIndex) =>
    Array.from({ length: docsPerApplication }, (_, index) => {
      faker.seed(seed + applicationIndex * 100 + index);
      const document = documents[(applicationIndex + index) % documents.length];

      const relationType =
        document.kind === "resume"
          ? "cv"
          : document.kind === "cover-letter"
            ? "cover-letter"
            : "attachment";

      return {
        application_id: applicationId,
        document_id: document.id,
        relation_type: relationType,
        created_at: faker.date.recent({ days: 30 }).toISOString(),
      };
    }),
  );
}
