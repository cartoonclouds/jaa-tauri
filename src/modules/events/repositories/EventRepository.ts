import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";
import type { IRepository } from "@shared/types/repository";

import { toDate, toNullableDate } from "@shared/utils/toDate";

export type EventCreatePayload = Pick<
  Event,
  "applicationId" | "contactId" | "type" | "title" | "description" | "eventAt"
>;
export type EventUpdatePayload = Partial<EventCreatePayload> & { id: string };

export type IEventRepository = IRepository<
  Event,
  EventCreatePayload,
  EventUpdatePayload
>;

export class EventRepository implements IEventRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Event[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM events ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      applicationId: String(row.application_id),
      contactId: (row.contact_id as string | null) ?? null,
      type: String(row.type),
      title: String(row.title),
      description: (row.description as string | null) ?? null,
      eventAt: toNullableDate(row.event_at),
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    }));
  }

  async create(payload: EventCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO events (id, application_id, contact_id, type, title, description, event_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [
        id,
        payload.applicationId,
        payload.contactId ?? null,
        payload.type,
        payload.title,
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
