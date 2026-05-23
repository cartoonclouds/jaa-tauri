import { SettingRepository } from "@modules/settings";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("SettingRepository.upsert", () => {
  it("writes defaults when payload is empty", async () => {
    const db = mockDb();
    const repository = new SettingRepository(db as never);

    await repository.upsert({});

    expect(db.execute).toHaveBeenCalledOnce();
  });

  it("writes provided setting values", async () => {
    const db = mockDb();
    const repository = new SettingRepository(db as never);

    await repository.upsert({
      theme: "dark",
      notificationsEnabled: false,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
