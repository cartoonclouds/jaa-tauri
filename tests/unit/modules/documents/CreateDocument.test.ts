import { DocumentRepository } from "@modules/documents";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("DocumentRepository.create", () => {
  it("rejects missing required fields", async () => {
    const { db } = createMockDb();
    const repository = new DocumentRepository(db);

    await expect(
      repository.create({
        title: "",
        kind: "",
        filePath: "",
        mimeType: null,
        sizeBytes: null,
        checksum: null,
      }),
    ).rejects.toThrow("Document title, kind, and file path are required");
  });

  it("inserts a document row", async () => {
    const { db } = createMockDb();
    const repository = new DocumentRepository(db);

    await repository.create({
      title: "CV",
      kind: "cv",
      filePath: "/docs/cv.pdf",
      mimeType: null,
      sizeBytes: null,
      checksum: null,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
