import { upsertSetting } from "@modules/settings";
import { describe, expect, it, vi } from "vitest";

function mockDb() {
  return {
    execute: vi.fn(async () => ({ rowsAffected: 1 })),
  };
}

describe("upsertSetting", () => {
  it("writes defaults when payload is empty", async () => {
    const db = mockDb();

    await upsertSetting(db as never, {});

    expect(db.execute).toHaveBeenCalledOnce();
  });

  it("writes provided setting values", async () => {
    const db = mockDb();

    await upsertSetting(db as never, {
      theme: "dark",
      notificationsEnabled: false,
    });

    expect(db.execute).toHaveBeenCalledOnce();
  });
});
