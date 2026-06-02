import { SettingRepository } from "@modules/settings";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

describe("SettingRepository.upsert", () => {
  it("writes defaults when payload is empty", async () => {
    const { db } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert({});

    expect(db.execute).toHaveBeenCalledOnce();
  });

  it("writes provided setting values", async () => {
    const { db } = createMockDb();
    const repository = new SettingRepository(db);

    await repository.upsert({
      theme: "dark",
      notificationsEnabled: false,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
