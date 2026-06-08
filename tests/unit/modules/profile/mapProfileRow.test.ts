import { mapProfileRowToEntity } from "@modules/profile/application/mappers/mapProfileRow";
import { describe, expect, it } from "vitest";

import { buildProfileRow } from "../../../fixtures/factories/testPayloadFactories";

describe("mapProfileRowToEntity", () => {
  it("keeps timestamp fields valid when the driver returns Date values", () => {
    const profile = mapProfileRowToEntity(buildProfileRow());

    expect(profile.createdAt).toBeInstanceOf(Date);
    expect(profile.updatedAt).toBeInstanceOf(Date);
    expect(profile.createdAt.toISOString()).toBe("2026-05-20T10:15:30.000Z");
    expect(profile.updatedAt.toISOString()).toBe("2026-05-20T10:20:30.000Z");
  });
});
