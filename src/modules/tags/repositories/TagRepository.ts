import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";
import type { IRepository } from "@shared/types/repository";

export type TagCreatePayload = Pick<Tag, "name" | "color">;
export type TagUpdatePayload = Partial<TagCreatePayload> & { id: string };

export type ITagRepository = IRepository<
  Tag,
  TagCreatePayload,
  TagUpdatePayload
>;

export class TagRepository implements ITagRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Tag[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM tags ORDER BY created_at DESC",
    );
    return rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      color: (row.color as string | null) ?? null,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));
  }

  async create(payload: TagCreatePayload): Promise<string> {
    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO tags (id, name, color, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [id, payload.name, payload.color ?? null],
    );
    return id;
  }

  async update(payload: TagUpdatePayload): Promise<void> {
    await this.db.execute(
      "UPDATE tags SET name = COALESCE($1, name), color = COALESCE($2, color), updated_at = CURRENT_TIMESTAMP WHERE id = $3",
      [payload.name ?? null, payload.color ?? null, payload.id],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute("DELETE FROM tags WHERE id = $1", [id]);
  }
}
