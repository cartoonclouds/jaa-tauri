import type { DatabaseDriver } from "@/services/database/DatabaseDriver";

import { ProfileRepository } from "@modules/profile";
import { describe, expect, it, vi } from "vitest";

function createMockDb(): {
  db: DatabaseDriver;
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(() => Promise.resolve({ rowsAffected: 1 }));

  const db: DatabaseDriver = {
    name: "mock-db",
    select: vi.fn(() => Promise.resolve([])),
    execute: executeMock,
    transaction: async <T>(callback: (tx: DatabaseDriver) => Promise<T>) =>
      callback(db),
  };

  return { db, executeMock };
}

describe("ProfileRepository.create", () => {
  it("rejects missing full name", async () => {
    const { db } = createMockDb();
    const repository = new ProfileRepository(db);

    await expect(repository.create({ fullName: "" })).rejects.toThrow(
      "Profile full name is required",
    );
  });

  it("inserts profile row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new ProfileRepository(db);

    await repository.create({ fullName: "John Doe" });

    expect(executeMock).toHaveBeenCalledOnce();
  });
});
