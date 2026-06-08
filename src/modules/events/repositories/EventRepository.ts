import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";
import type {
  EventCreatePayload,
  EventUpdatePayload,
  IEventRepository,
} from "@modules/events/types";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import {
  EVENT_COPY_BY_STAGE,
  type InteractionStage,
} from "@modules/events/constants";
import { EventRepositoryCreateSchema } from "@modules/events/domain/zod/event.schema";
import { ValidationError } from "@shared/domain/errors";

const EVENT_LINK_ID_SEPARATOR = "::";

function toEventLinkId(applicationId: string, eventId: string): string {
  return `${applicationId}${EVENT_LINK_ID_SEPARATOR}${eventId}`;
}

function parseEventLinkId(id: string): {
  applicationId: string;
  eventId: string;
} {
  const separatorIndex = id.indexOf(EVENT_LINK_ID_SEPARATOR);
  if (separatorIndex <= 0) {
    throw new ValidationError("Event id is invalid");
  }

  const applicationId = id.slice(0, separatorIndex);
  const eventId = id.slice(separatorIndex + EVENT_LINK_ID_SEPARATOR.length);
  if (!applicationId || !eventId) {
    throw new ValidationError("Event id is invalid");
  }

  return { applicationId, eventId };
}

/**
 * Implements event repository.
 */
export class EventRepository implements IEventRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private normalizeSortOrder(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.trunc(value));
  }

  private async resolveNextSortOrder(applicationId: string): Promise<number> {
    const rows = await this.db.select<{ max_sort_order: number | null }>(
      `SELECT MAX(sort_order) AS max_sort_order
       FROM application_events
       WHERE application_id = $1`,
      [applicationId],
    );

    const maxSortOrder = rows[0]?.max_sort_order;
    if (typeof maxSortOrder !== "number" || !Number.isFinite(maxSortOrder)) {
      return 1;
    }

    return this.normalizeSortOrder(maxSortOrder) + 1;
  }

  private async resolveCurrentSortOrder(
    applicationId: string,
    eventId: string,
  ): Promise<number> {
    const rows = await this.db.select<{ sort_order: number | null }>(
      `SELECT sort_order
       FROM application_events
       WHERE application_id = $1
         AND event_id = $2
       LIMIT 1`,
      [applicationId, eventId],
    );

    const sortOrder = rows[0]?.sort_order;
    if (typeof sortOrder !== "number" || !Number.isFinite(sortOrder)) {
      return this.resolveNextSortOrder(applicationId);
    }

    return this.normalizeSortOrder(sortOrder);
  }

  private async resolveEventIdByType(type: InteractionStage): Promise<string> {
    const defaultCopy = EVENT_COPY_BY_STAGE[type];

    await this.db.execute(
      "INSERT OR IGNORE INTO events (id, type, title, description, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [crypto.randomUUID(), type, defaultCopy.title, defaultCopy.description],
    );

    const rows = await this.db.select<{ id: string }>(
      "SELECT id FROM events WHERE type = $1 ORDER BY id ASC LIMIT 1",
      [type],
    );

    const eventId = rows[0]?.id;
    if (!eventId) {
      throw new ValidationError("Event type is invalid");
    }

    return eventId;
  }

  async list(): Promise<Event[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         ae.application_id || '${EVENT_LINK_ID_SEPARATOR}' || ae.event_id AS id,
         ae.application_id,
         ae.sort_order,
         ae.notes,
         e.type,
         e.title,
         e.description,
         ae.event_at,
         COALESCE(ae.event_at, ae.created_at) AS created_at,
         COALESCE(ae.event_at, ae.created_at) AS updated_at
       FROM application_events ae
       INNER JOIN events e
         ON ae.event_id = e.id
       ORDER BY
         ae.application_id ASC,
         ae.sort_order ASC,
         e.type ASC,
         ae.created_at ASC`,
    );
    return rows.map((row) => mapEventRowToEntity(row));
  }

  async create(payload: EventCreatePayload): Promise<string> {
    const parseResult = EventRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      console.error("EventRepository.create validation failed", {
        payload,
        error: parseResult.error,
      });
      throw new ValidationError(
        "Event applicationId, type, and title are required",
      );
    }

    if (!parseResult.data.applicationId) {
      throw new ValidationError(
        "Event applicationId, type, and title are required",
      );
    }

    if (!parseResult.data.title.trim()) {
      throw new ValidationError(
        "Event applicationId, type, and title are required",
      );
    }

    const eventId = await this.resolveEventIdByType(parseResult.data.type);
    const eventAtBinding = payload.eventAt ?? null;
    const notesBinding = payload.notes ?? null;
    const sortOrder =
      payload.sortOrder !== undefined
        ? this.normalizeSortOrder(payload.sortOrder)
        : await this.resolveNextSortOrder(parseResult.data.applicationId);

    await this.db.execute(
      `INSERT INTO application_events (application_id, event_id, event_at, notes, sort_order, created_at)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT(application_id, event_id)
       DO UPDATE SET
         event_at = COALESCE($3, CURRENT_TIMESTAMP),
         notes = $4,
         sort_order = $5`,
      [
        parseResult.data.applicationId,
        eventId,
        eventAtBinding,
        notesBinding,
        sortOrder,
      ],
    );

    return toEventLinkId(parseResult.data.applicationId, eventId);
  }

  async update(payload: EventUpdatePayload): Promise<void> {
    const current = parseEventLinkId(payload.id);
    const nextType = payload.type;
    const hasEventAtOverride = payload.eventAt !== undefined;
    const hasNotesOverride = payload.notes !== undefined;
    const hasSortOrderOverride = payload.sortOrder !== undefined;
    const resolveProvidedSortOrder = (): number =>
      this.normalizeSortOrder(payload.sortOrder ?? 0);

    if (!nextType) {
      if (hasEventAtOverride && hasNotesOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               notes = $4,
               sort_order = $5
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            payload.notes ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasEventAtOverride && hasNotesOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               notes = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            payload.notes ?? null,
          ],
        );
      } else if (hasEventAtOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               sort_order = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasEventAtOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.eventAt ?? null],
        );
      } else if (hasNotesOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET notes = $3,
               sort_order = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.notes ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasNotesOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET notes = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.notes ?? null],
        );
      } else if (hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET sort_order = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, resolveProvidedSortOrder()],
        );
      }

      return;
    }

    const targetEventId = await this.resolveEventIdByType(nextType);

    if (targetEventId === current.eventId) {
      if (hasEventAtOverride && hasNotesOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               notes = $4,
               sort_order = $5
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            payload.notes ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasEventAtOverride && hasNotesOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               notes = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            payload.notes ?? null,
          ],
        );
      } else if (hasEventAtOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3,
               sort_order = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.eventAt ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasEventAtOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.eventAt ?? null],
        );
      } else if (hasNotesOverride && hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET notes = $3,
               sort_order = $4
           WHERE application_id = $1
             AND event_id = $2`,
          [
            current.applicationId,
            current.eventId,
            payload.notes ?? null,
            resolveProvidedSortOrder(),
          ],
        );
      } else if (hasNotesOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET notes = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.notes ?? null],
        );
      } else if (hasSortOrderOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET sort_order = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, resolveProvidedSortOrder()],
        );
      } else {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = COALESCE(event_at, CURRENT_TIMESTAMP)
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId],
        );
      }

      return;
    }

    const targetEventAt = hasEventAtOverride ? (payload.eventAt ?? null) : null;
    const targetNotes = hasNotesOverride ? (payload.notes ?? null) : null;
    const targetSortOrder = hasSortOrderOverride
      ? this.normalizeSortOrder(payload.sortOrder ?? 0)
      : await this.resolveCurrentSortOrder(
          current.applicationId,
          current.eventId,
        );

    await this.db.execute(
      `INSERT INTO application_events (application_id, event_id, event_at, notes, sort_order, created_at)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT(application_id, event_id)
       DO UPDATE SET
         event_at = COALESCE($3, CURRENT_TIMESTAMP),
         notes = $4,
         sort_order = $5`,
      [
        current.applicationId,
        targetEventId,
        targetEventAt,
        targetNotes,
        targetSortOrder,
      ],
    );

    await this.db.execute(
      `UPDATE application_events
       SET event_at = NULL
       WHERE application_id = $1
         AND event_id = $2`,
      [current.applicationId, current.eventId],
    );
  }

  async delete(id: string): Promise<void> {
    const eventLink = parseEventLinkId(id);
    await this.db.execute(
      `UPDATE application_events
       SET event_at = NULL
       WHERE application_id = $1
         AND event_id = $2`,
      [eventLink.applicationId, eventLink.eventId],
    );
  }
}
