import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import {
  CreateTagSchema,
  TagModelTypeSchema,
  TagModelTypeValueSchema,
  TagRepositoryCreateSchema,
  TagSchema,
} from "@modules/tags/domain/zod/tag.schema";
import { temporalNowIsoString } from "@shared/utils/temporal";
import { describe, expect, it } from "vitest";

import { buildTagCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("tag schema", () => {
  it("accepts valid persisted and create tag shapes", () => {
    expect(TagModelTypeValueSchema.safeParse("company").success).toBe(true);
    expect(TagModelTypeSchema.safeParse(TagModelType.Application).success).toBe(
      true,
    );
    expect(
      TagSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440007",
        name: "urgent",
        color: "#ef4444",
        modelType: TagModelType.General,
        createdAt: temporalNowIsoString(),
        updatedAt: temporalNowIsoString(),
      }).success,
    ).toBe(true);
    expect(CreateTagSchema.safeParse(buildTagCreatePayload()).success).toBe(
      true,
    );
    expect(
      TagRepositoryCreateSchema.safeParse(buildTagCreatePayload()).success,
    ).toBe(true);
  });

  it("rejects blank names and raw model type strings in enum instance fields", () => {
    expect(
      CreateTagSchema.safeParse(buildTagCreatePayload({ name: "" })).success,
    ).toBe(false);
    expect(TagModelTypeSchema.safeParse("application").success).toBe(false);
  });
});
