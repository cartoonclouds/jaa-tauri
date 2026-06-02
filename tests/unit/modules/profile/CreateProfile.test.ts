import { ProfileRepository } from "@modules/profile";
import { createMockDb } from "@testUtils/dbTestUtils";
import { describe, expect, it } from "vitest";

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
