import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";
import type { IRepository } from "@shared/types";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import {
  EVENT_COPY_BY_STAGE,
  type InteractionStage,
} from "@modules/events/constants";
import { EventRepositoryCreateSchema } from "@modules/events/domain/zod/event.schema";

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
    throw new Error("Event id is invalid");
  }

  const applicationId = id.slice(0, separatorIndex);
  const eventId = id.slice(separatorIndex + EVENT_LINK_ID_SEPARATOR.length);
  if (!applicationId || !eventId) {
    throw new Error("Event id is invalid");
  }

  return { applicationId, eventId };
}

/**
 * Type alias for event create payload.
 */
export interface EventCreatePayload {
  applicationId: string;
  type: InteractionStage;
  title: string;
  description: string | null;
  eventAt?: string | null;
}
/**
 * Type alias for event update payload.
 */
export interface EventUpdatePayload {
  id: string;
  type?: InteractionStage;
  title?: string;
  description?: string | null;
  eventAt?: string | null;
}

/**
 * Defines ievent repository.
 */
export interface IEventRepository extends IRepository<
  Event,
  EventCreatePayload,
  EventUpdatePayload
> {}

/**
 * Implements event repository.
 */
export class EventRepository implements IEventRepository {
  constructor(private readonly db: DatabaseDriver) {}

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
      throw new Error("Event type is invalid");
    }

    return eventId;
  }

  async list(): Promise<Event[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         ae.application_id || '${EVENT_LINK_ID_SEPARATOR}' || ae.event_id AS id,
         ae.application_id,
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
         CASE WHEN ae.event_at IS NULL THEN 1 ELSE 0 END,
         ae.event_at DESC,
         ae.created_at DESC,
         e.type ASC`,
    );
    return rows.map((row) => mapEventRowToEntity(row));
  }

  async create(payload: EventCreatePayload): Promise<string> {
    const parseResult = EventRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error("Event applicationId, type, and title are required");
    }

    if (!parseResult.data.applicationId) {
      throw new Error("Event applicationId, type, and title are required");
    }

    if (!parseResult.data.title.trim()) {
      throw new Error("Event applicationId, type, and title are required");
    }

    const eventId = await this.resolveEventIdByType(parseResult.data.type);
    const eventAtBinding = payload.eventAt ?? null;
    await this.db.execute(
      `INSERT INTO application_events (application_id, event_id, event_at, created_at)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
       ON CONFLICT(application_id, event_id)
       DO UPDATE SET event_at = COALESCE($3, CURRENT_TIMESTAMP)`,
      [parseResult.data.applicationId, eventId, eventAtBinding],
    );

    return toEventLinkId(parseResult.data.applicationId, eventId);
  }

  async update(payload: EventUpdatePayload): Promise<void> {
    const current = parseEventLinkId(payload.id);
    const nextType = payload.type;
    const hasEventAtOverride = payload.eventAt !== undefined;

    if (!nextType) {
      if (hasEventAtOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.eventAt ?? null],
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

    const targetEventId = await this.resolveEventIdByType(nextType);

    if (targetEventId === current.eventId) {
      if (hasEventAtOverride) {
        await this.db.execute(
          `UPDATE application_events
           SET event_at = $3
           WHERE application_id = $1
             AND event_id = $2`,
          [current.applicationId, current.eventId, payload.eventAt ?? null],
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

    await this.db.execute(
      `INSERT INTO application_events (application_id, event_id, event_at, created_at)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
       ON CONFLICT(application_id, event_id)
       DO UPDATE SET event_at = COALESCE($3, CURRENT_TIMESTAMP)`,
      [current.applicationId, targetEventId, targetEventAt],
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
