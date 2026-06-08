import { DocumentRepository } from "@modules/documents";
import { describe, expect, it } from "vitest";

import { buildDocumentCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("DocumentRepository.create", () => {
  it("rejects missing required fields", async () => {
    const { db } = createMockDb();
    const repository = new DocumentRepository(db);

    await expect(
      repository.create(
        buildDocumentCreatePayload({
          title: "",
          kind: "",
          filePath: "",
        }),
      ),
    ).rejects.toThrow("Document title, kind, and file path are required");
  });

  it("inserts a document row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new DocumentRepository(db);

    await repository.create(buildDocumentCreatePayload());

    expect(executeMock).toHaveBeenCalledOnce();
  });
});
