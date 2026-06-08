import { SettingRepository } from "@modules/settings";
import { describe, expect, it } from "vitest";

import { buildSettingUpsertPayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("SettingRepository.upsert", () => {
  it("writes defaults when payload is empty", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert(buildSettingUpsertPayload());

    expect(executeMock).toHaveBeenCalledOnce();
  });

  it("writes provided setting values", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert(
      buildSettingUpsertPayload({
        theme: "dark",
        notificationsEnabled: false,
      }),
    );

    expect(executeMock).toHaveBeenCalledOnce();
  });
});
