import type { Event } from "@modules/events/domain/entities/Event";

export function mapEventRowToEntity(row: Record<string, unknown>): Event {
  return {
    id: String(row.id),
    applicationId: String(row.application_id),
    contactId: (row.contact_id as string | null) ?? null,
    type: String(row.type),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    eventAt: (row.event_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
