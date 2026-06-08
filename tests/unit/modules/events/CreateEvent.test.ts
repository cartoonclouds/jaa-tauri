import { EventRepository } from "@modules/events";
import { describe, expect, it } from "vitest";

import {
  buildEventCreatePayload,
  buildEventUpdatePayload,
} from "../../../fixtures/factories/testPayloadFactories";
import { createMockDbWithOptions } from "../../shared/utils/dbTestUtils";

describe("EventRepository.create", () => {
  it("rejects missing required fields", async () => {
    const { db } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);

    await expect(
      repository.create(
        buildEventCreatePayload({
          applicationId: "",
          type: "" as never,
          title: "",
        }),
      ),
    ).rejects.toThrow("Event applicationId, type, and title are required");
  });

  it("marks a canonical event as completed for an application", async () => {
    const { db, executeMock, selectMock } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);

    await repository.create(buildEventCreatePayload());

    expect(executeMock).toHaveBeenCalledTimes(2);
    expect(selectMock).toHaveBeenCalledTimes(2);
  });

  it("uses a provided eventAt timestamp when creating the flow step", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);
    const eventAt = "2026-05-29T09:30:00.000Z";

    await repository.create(
      buildEventCreatePayload({
        eventAt,
      }),
    );

    expect(executeMock).toHaveBeenLastCalledWith(
      expect.stringContaining("COALESCE($3, CURRENT_TIMESTAMP)"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
        null,
        1,
      ],
    );
  });

  it("persists explicit sortOrder when creating the flow step", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);

    await repository.create(
      buildEventCreatePayload({
        sortOrder: 7,
      }),
    );

    expect(executeMock).toHaveBeenLastCalledWith(
      expect.stringContaining("sort_order"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        null,
        null,
        7,
      ],
    );
  });
});

describe("EventRepository.update", () => {
  it("uses a provided eventAt timestamp when updating an existing step", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);
    const eventAt = "2026-06-01T14:15:00.000Z";

    await repository.update(
      buildEventUpdatePayload({
        type: "Interview/Technical Interview",
        eventAt,
      }),
    );

    expect(executeMock).toHaveBeenLastCalledWith(
      expect.stringContaining("SET event_at = $3"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        eventAt,
      ],
    );
  });

  it("updates sortOrder without mutating eventAt", async () => {
    const { db, executeMock } = createMockDbWithOptions([], {
      select: (sql: unknown) => {
        if (String(sql).includes("SELECT id FROM events WHERE type = $1")) {
          return Promise.resolve([{ id: "Interview/Technical Interview" }]);
        }

        return Promise.resolve([]);
      },
      execute: () => Promise.resolve({ rowsAffected: 1 }),
    });
    const repository = new EventRepository(db);

    await repository.update(
      buildEventUpdatePayload({
        sortOrder: 4,
      }),
    );

    expect(executeMock).toHaveBeenLastCalledWith(
      expect.stringContaining("SET sort_order = $3"),
      [
        "11111111-1111-4111-8111-111111111111",
        "Interview/Technical Interview",
        4,
      ],
    );
  });
});
