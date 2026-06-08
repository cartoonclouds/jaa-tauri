import { TagRepository } from "@modules/tags";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import { describe, expect, it } from "vitest";

import { buildTagCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("TagRepository.create", () => {
  it("rejects empty tag name", async () => {
    const { db } = createMockDb();
    const repository = new TagRepository(db);

    await expect(
      repository.create(buildTagCreatePayload({ name: "  " })),
    ).rejects.toThrow("Tag name is required");
  });

  it("inserts tag row with default model type", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new TagRepository(db);

    await repository.create(buildTagCreatePayload());

    expect(executeMock).toHaveBeenCalledOnce();
    const [sql, params] = executeMock.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("model_type");
    expect(params).toContain("general");
  });

  it("inserts tag row with provided model type", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new TagRepository(db);

    await repository.create(
      buildTagCreatePayload({
        name: "referral",
        modelType: TagModelType.Application,
      }),
    );

    const [, params] = executeMock.mock.calls[0] as [string, unknown[]];
    expect(params).toContain("application");
  });
});
