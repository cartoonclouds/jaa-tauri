import { ProfileRepository } from "@modules/profile";
import { describe, expect, it } from "vitest";

import { buildProfileCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("ProfileRepository.create", () => {
  it("rejects missing full name", async () => {
    const { db } = createMockDb();
    const repository = new ProfileRepository(db);

    await expect(
      repository.create(buildProfileCreatePayload({ fullName: "" })),
    ).rejects.toThrow("Profile full name is required");
  });

  it("inserts profile row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new ProfileRepository(db);

    await repository.create(buildProfileCreatePayload());

    expect(executeMock).toHaveBeenCalledOnce();
  });
});
