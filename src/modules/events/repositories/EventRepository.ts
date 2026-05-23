import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";
import type { IRepository } from "@shared/types";

import { mapEventRowToEntity } from "@modules/events/application/mappers/mapEventRow";
import { EventRepositoryCreateSchema } from "@modules/events/domain/zod/event.schema";
import {
  buildSelectAllOrderedQuery,
  DEFAULT_CREATED_AT_ORDER_BY,
} from "@shared/utils/datatableQuery";

export type EventCreatePayload = Pick<
  Event,
  "applicationId" | "contactId" | "type" | "title" | "description" | "eventAt"
>;
export type EventUpdatePayload = Partial<EventCreatePayload> & { id: string };

export interface IEventRepository extends IRepository<
  Event,
  EventCreatePayload,
  EventUpdatePayload
> {}

export class EventRepository implements IEventRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Event[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      buildSelectAllOrderedQuery({
        tableName: "events",
        orderByClause: DEFAULT_CREATED_AT_ORDER_BY,
      }),
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
      "INSERT INTO events (id, application_id, contact_id, type, title, description, event_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        parseResult.data.applicationId,
        parseResult.data.contactId ?? null,
        parseResult.data.type,
        title,
        payload.description ?? null,
        payload.eventAt ? payload.eventAt.toISOString() : null,
      ],
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
