import { createDocument } from "@modules/documents";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("createDocument", () => {
  it("rejects missing required fields", async () => {
    const db = mockDb();

    await expect(
      createDocument(db as never, { title: "", kind: "", filePath: "" }),
    ).rejects.toThrow("Document title, kind, and file path are required");
  });

  it("inserts a document row", async () => {
    const db = mockDb();

    await createDocument(db as never, {
      title: "CV",
      kind: "cv",
      filePath: "/docs/cv.pdf",
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
