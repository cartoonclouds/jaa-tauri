import {
  CreateDocumentSchema,
  DocumentRepositoryCreateSchema,
  DocumentSchema,
} from "@modules/documents/domain/zod/document.schema";
import { describe, expect, it } from "vitest";

import { buildDocumentCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("document schema", () => {
  it("accepts valid persisted and create document shapes", () => {
    expect(
      DocumentSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440003",
        title: "Resume",
        kind: "resume",
        filePath: "/docs/resume.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        checksum: "abc123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).success,
    ).toBe(true);
    expect(CreateDocumentSchema.safeParse(buildDocumentCreatePayload()).success).toBe(
      true,
    );
    expect(
      DocumentRepositoryCreateSchema.safeParse({
        title: "Resume",
        kind: "resume",
        filePath: "/docs/resume.pdf",
      }).success,
    ).toBe(true);
  });

  it("rejects blank required fields on document inputs", () => {
    expect(
      CreateDocumentSchema.safeParse(
        buildDocumentCreatePayload({ title: "" }),
      ).success,
    ).toBe(false);
    expect(
      DocumentRepositoryCreateSchema.safeParse({
        title: "",
        kind: "resume",
        filePath: "/docs/resume.pdf",
      }).success,
    ).toBe(true);
  });
});