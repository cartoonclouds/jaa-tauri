import { ContactRepository } from "@modules/contacts";
import { describe, expect, it } from "vitest";

import { buildContactCreatePayload } from "../../../fixtures/factories/testPayloadFactories";
import { createMockDb } from "../../shared/utils/dbTestUtils";

describe("ContactRepository.create", () => {
  it("rejects empty full name", async () => {
    const { db } = createMockDb();
    const repository = new ContactRepository(db);

    await expect(
      repository.create(
        buildContactCreatePayload({
          fullName: "  ",
          type: "company",
        }),
      ),
    ).rejects.toThrow("Contact full name is required");
  });

  it("inserts a contact row", async () => {
    const { db, executeMock } = createMockDb();
    const repository = new ContactRepository(db);

    await repository.create(buildContactCreatePayload());

    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
