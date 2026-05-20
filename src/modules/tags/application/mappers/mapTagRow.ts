import type { Tag } from "@modules/tags/domain/entities/Tag";

export function mapTagRowToEntity(row: Record<string, unknown>): Tag {
  return {
    id: String(row.id),
    name: String(row.name),
    color: (row.color as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
