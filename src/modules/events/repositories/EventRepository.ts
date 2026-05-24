import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";
import type { IRepository } from "@shared/types";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import { EventRepositoryCreateSchema } from "@modules/events/domain/zod/event.schema";

/**
 * Type alias for event create payload.
 */
export type EventCreatePayload = Pick<
  Event,
  "applicationId" | "contactId" | "type" | "title" | "description" | "eventAt"
>;
/**
 * Type alias for event update payload.
 */
export type EventUpdatePayload = Partial<EventCreatePayload> & { id: string };

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

  async list(): Promise<Event[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      `SELECT
         e.id,
         ae.application_id,
         e.contact_id,
         e.type,
         e.title,
         e.description,
         e.event_at,
         e.created_at,
         e.updated_at
       FROM events e
       INNER JOIN application_events ae
         ON ae.event_id = e.id
       ORDER BY e.created_at DESC, e.id DESC`,
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

    const title = parseResult.data.title.trim();
    if (!title) {
      throw new Error("Event applicationId, type, and title are required");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO events (id, contact_id, type, title, description, event_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        parseResult.data.contactId ?? null,
        parseResult.data.type,
        title,
        payload.description ?? null,
        payload.eventAt ? payload.eventAt.toISOString() : null,
      ],
    );

    await this.db.execute(
      "INSERT INTO application_events (application_id, event_id) VALUES ($1, $2)",
      [parseResult.data.applicationId, id],
    );

    return id;
  }

  async update(payload: EventUpdatePayload): Promise<void> {
    await this.db.execute(
      `UPDATE events
       SET type = COALESCE($1, type),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           event_at = COALESCE($4, event_at),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [
        payload.type ?? null,
        payload.title ?? null,
        payload.description ?? null,
        payload.eventAt ? payload.eventAt.toISOString() : null,
        payload.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM events WHERE id = $1", [id]);
  }
}
