import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Event } from "@modules/events/domain/entities/Event";

export async function listEvents(db: DatabaseDriver): Promise<Event[]> {
  const rows = await db.select<Record<string, unknown>>(
    "SELECT * FROM events ORDER BY created_at DESC",
  );

  return rows.map((row) => ({
    id: String(row.id),
    applicationId: String(row.application_id),
    contactId: (row.contact_id as string | null) ?? null,
    type: String(row.type),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    eventAt: (row.event_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}
