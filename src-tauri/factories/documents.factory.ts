import { faker } from "@faker-js/faker";

export interface DocumentRow {
  id: string;
  title: string;
  kind: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  checksum: string | null;
  created_at: string;
  updated_at: string;
}

export function createDocumentRows(count: number, seed = 1400): DocumentRow[] {
  faker.seed(seed);
  faker.setDefaultRefDate("2026-01-01T00:00:00.000Z");

  return Array.from({ length: count }, (_, index) => {
    faker.seed(seed + index);
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    const kind = faker.helpers.arrayElement([
      "resume",
      "cover-letter",
      "job-spec",
      "portfolio",
      "notes",
    ]);
    const extension = faker.helpers.arrayElement(["pdf", "docx"]);

    let title = `${faker.person.jobType()} ${kind}`;
    if (kind === "resume") {
      title = `${faker.person.fullName()} Resume`;
    }

    return {
      id: faker.string.uuid(),
      title,
      kind,
      file_path: `/documents/${faker.string.uuid()}.${extension}`,
      mime_type:
        extension === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: faker.number.int({ min: 2048, max: 1024 * 512 }),
      checksum: faker.string.hexadecimal({
        length: 32,
        casing: "lower",
        prefix: "",
      }),
      created_at: createdAt,
      updated_at: createdAt,
    };
  });
}
