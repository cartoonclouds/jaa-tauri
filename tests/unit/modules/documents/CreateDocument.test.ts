import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { DocumentRepository } from "@modules/documents";
import { describe, expect, it, vi } from "vitest";
type LocalSelectRows = Record<string, unknown>[];

function createMockDb(rows: LocalSelectRows = []): {
  db: DatabaseDriver;
  selectMock: ReturnType<typeof vi.fn>;
  executeMock: ReturnType<typeof vi.fn>;
  transactionMock: ReturnType<typeof vi.fn>;
} {
  const selectMock = vi.fn(() => Promise.resolve(rows));
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 0 }));
  const transactionMock = vi.fn(
    <T>(callback: (tx: DatabaseDriver) => Promise<T>) => callback(db),
  );

  const db = {
    name: "mock",
    select: selectMock,
    execute: executeMock,
    transaction: transactionMock,
  } as unknown as DatabaseDriver;

  return {
    db,
    selectMock,
    executeMock,
    transactionMock,
  };
}


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
