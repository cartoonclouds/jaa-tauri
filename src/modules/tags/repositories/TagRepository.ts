import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { toDate } from "@shared/utils/toDate";

export type TagCreatePayload = Pick<Tag, "name" | "color">;
export type TagUpdatePayload = Partial<TagCreatePayload> & { id: string };

export interface ITagRepository extends IRepository<
  Tag,
  TagCreatePayload,
  TagUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Tag>>;
}

export class TagRepository implements ITagRepository {
  constructor(private readonly db: DatabaseDriver) {}

  private mapTagRow(row: Record<string, unknown>): Tag {
    return {
      id: String(row.id),
      name: String(row.name),
      color: (row.color as string | null) ?? null,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    };
  }

  async list(): Promise<Tag[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM tags ORDER BY created_at DESC",
    );
    return rows.map((row) => this.mapTagRow(row));
  }

  async listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Tag>> {
    const rows = Math.max(1, query.rows);
    const page = Math.max(0, query.page);
    const search = query.search?.trim() ?? "";
    const hasSearch = search.length > 0;

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM tags WHERE name LIKE $1 OR COALESCE(color, '') LIKE $1",
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM tags",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM tags
           WHERE name LIKE $1 OR COALESCE(color, '') LIKE $1
           ORDER BY created_at DESC
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM tags
           ORDER BY created_at DESC
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => this.mapTagRow(row)),
      total: totalRows[0]?.total ?? 0,
    };
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
