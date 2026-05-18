import { faker } from "@faker-js/faker";

export interface DocumentRow {
  id: string;
  document_type:
    | "cv"
    | "cover_letter"
    | "portfolio"
    | "case_study"
    | "technical_test"
    | "job_description"
    | "certificate"
    | "reference"
    | "other";
  title: string;
  file_path: string;
  file_hash: string | null;
  version_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const DOCUMENT_TYPES: DocumentRow["document_type"][] = [
  "cv",
  "cover_letter",
  "portfolio",
  "case_study",
  "technical_test",
  "job_description",
  "certificate",
  "reference",
  "other",
];

export function createDocumentRow(index: number, seed = 2100): DocumentRow {
  faker.seed(seed + index);
  const createdAt = faker.date.past({ years: 1 }).toISOString();

  const documentType = faker.helpers.arrayElement(DOCUMENT_TYPES);
  const ext = faker.helpers.arrayElement(["pdf", "docx", "txt"]);

  return {
    id: faker.string.uuid(),
    document_type: documentType,
    title: `${faker.word.words({ count: { min: 2, max: 4 } })} ${documentType}`,
    file_path: `/documents/${documentType}-${faker.number.int({ min: 1000, max: 9999 })}.${ext}`,
    file_hash:
      faker.helpers.maybe(
        () =>
          faker.string.hexadecimal({ length: 64, casing: "lower", prefix: "" }),
        {
          probability: 0.85,
        },
      ) ?? null,
    version_label:
      faker.helpers.maybe(
        () =>
          `v${faker.number.int({ min: 1, max: 4 })}.${faker.number.int({ min: 0, max: 9 })}`,
        {
          probability: 0.7,
        },
      ) ?? null,
    notes:
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) ??
      null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

export function createDocumentRows(count: number, seed = 2100): DocumentRow[] {
  return Array.from({ length: count }, (_, index) =>
    createDocumentRow(index, seed),
  );
}
