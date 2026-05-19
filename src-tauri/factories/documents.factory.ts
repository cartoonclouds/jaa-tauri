import { faker } from "@faker-js/faker";

export interface DocumentRow {
  id: string;
  title: string;
  kind: string;
  file_path: string;
  mime_type: string;
  size_bytes: number;
  checksum: string;
  created_at: string;
  updated_at: string;
}

export function createDocumentRows(count: number, seed = 1400): DocumentRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return Array.from({ length: count }, (_, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    const kind = faker.helpers.arrayElement(["cv", "cover-letter", "job-spec", "notes"]);

    return {
      id: faker.string.uuid(),
      title: `${faker.person.jobType()} ${kind}`,
      kind,
      file_path: `/documents/${faker.string.uuid()}.pdf`,
      mime_type: "application/pdf",
      size_bytes: faker.number.int({ min: 2048, max: 1024 * 512 }),
      checksum: faker.string.hexadecimal({ length: 32, casing: "lower", prefix: "" }),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
