import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
} from "@shared/types";

import { mapTagRowToEntity } from "@modules/tags/application/mappers/mapTagRow";
import { TAG_SEARCH_FIELDS } from "@modules/tags/constants/tagDatatableFields";
import { TagRepositoryCreateSchema } from "@modules/tags/domain/zod/tag.schema";
import {
  buildSearchWhereClause,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

/**
 * Type alias for tag create payload.
 */
export type TagCreatePayload = Pick<Tag, "name" | "color">;
/**
 * Type alias for tag update payload.
 */
export type TagUpdatePayload = Partial<TagCreatePayload> & { id: string };

/**
 * Defines itag repository.
 */
export interface ITagRepository extends IRepository<
  Tag,
  TagCreatePayload,
  TagUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Tag>>;
}

/**
 * Implements tag repository.
 */
export class TagRepository implements ITagRepository {
  constructor(private readonly db: DatabaseDriver) {}

  async list(): Promise<Tag[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM tags ORDER BY name ASC",
    );
    return rows.map((row) => mapTagRowToEntity(row));
  }

  async listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Tag>> {
    const { hasSearch, page, rows, search } =
      normalizeDatatablePageQuery(query);
    const activeSearchFields = resolveSearchFields(
      TAG_SEARCH_FIELDS,
      query.searchFields,
    );
    const searchWhereClause = buildSearchWhereClause(activeSearchFields);

    const totalRows = hasSearch
      ? await this.db.select<{ total: number }>(
          `SELECT COUNT(*) AS total
           FROM tags
           WHERE ${searchWhereClause}`,
          [`%${search}%`],
        )
      : await this.db.select<{ total: number }>(
          "SELECT COUNT(*) AS total FROM tags",
        );

    const listRows = hasSearch
      ? await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM tags
           WHERE ${searchWhereClause}
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $2
           OFFSET $3`,
          [`%${search}%`, rows, page * rows],
        )
      : await this.db.select<Record<string, unknown>>(
          `SELECT *
           FROM tags
           ORDER BY ${DEFAULT_CREATED_AT_ORDER_BY}
           LIMIT $1
           OFFSET $2`,
          [rows, page * rows],
        );

    return {
      items: listRows.map((row) => mapTagRowToEntity(row)),
      total: totalRows[0]?.total ?? 0,
    };
  }

  async create(payload: TagCreatePayload): Promise<string> {
    const parseResult = TagRepositoryCreateSchema.safeParse(payload);
    if (!parseResult.success) {
      throw new Error("Tag name is required");
    }

    const name = parseResult.data.name.trim().toLowerCase();
    if (!name) {
      throw new Error("Tag name is required");
    }

    const id = crypto.randomUUID();
    await this.db.execute(
      "INSERT INTO tags (id, name, color, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [id, name, parseResult.data.color ?? null],
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








