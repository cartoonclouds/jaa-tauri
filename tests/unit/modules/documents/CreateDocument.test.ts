import { DocumentRepository } from "@modules/documents";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(() => Promise.resolve({ rowsAffected: 1 })),
  };
}

describe("DocumentRepository.create", () => {
  it("rejects missing required fields", async () => {
    const db = mockDb();
    const repository = new DocumentRepository(db as never);

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
    const db = mockDb();
    const repository = new DocumentRepository(db as never);

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
