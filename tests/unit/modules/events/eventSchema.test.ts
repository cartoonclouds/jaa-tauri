import {
  CreateEventSchema,
  EventRepositoryCreateSchema,
  EventSchema,
} from "@modules/events/domain/zod/event.schema";
import { temporalNowIsoString } from "@shared/utils/temporal";
import { describe, expect, it } from "vitest";

import { buildEventCreatePayload } from "../../../fixtures/factories/testPayloadFactories";

describe("event schema", () => {
  it("accepts valid persisted and create event shapes", () => {
    expect(
      EventSchema.safeParse({
        id: "event-1",
        applicationId: "550e8400-e29b-41d4-a716-446655440004",
        sortOrder: 2,
        type: "Interview/Technical Interview",
        title: "Technical interview",
        description: null,
        notes: null,
        eventAt: temporalNowIsoString(),
        createdAt: temporalNowIsoString(),
        updatedAt: temporalNowIsoString(),
      }).success,
    ).toBe(true);
    expect(
      CreateEventSchema.safeParse({
        ...buildEventCreatePayload(),
        notes: null,
      }).success,
    ).toBe(true);
    expect(
      EventRepositoryCreateSchema.safeParse(buildEventCreatePayload()).success,
    ).toBe(true);
  });

  it("rejects unknown stages and blank titles", () => {
    expect(
      CreateEventSchema.safeParse(
        buildEventCreatePayload({
          title: "",
          type: "Interview/Technical Interview",
        }),
      ).success,
    ).toBe(false);
    expect(
      EventSchema.safeParse({
        id: "event-1",
        applicationId: "550e8400-e29b-41d4-a716-446655440004",
        sortOrder: 2,
        type: "Unknown/Stage",
        title: "Technical interview",
        description: null,
        notes: null,
        eventAt: null,
        createdAt: temporalNowIsoString(),
        updatedAt: temporalNowIsoString(),
      }).success,
    ).toBe(false);
  });
});
