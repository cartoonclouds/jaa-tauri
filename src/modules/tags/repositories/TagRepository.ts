import type { DatabaseDriver } from "@/services/database/DatabaseDriver";
import type { Tag } from "@modules/tags/domain/entities/Tag";
import type { TagModelType as TagModelTypeValue } from "@modules/tags/domain/enums/TagModelType";
import type {
  DatatablePageQuery,
  DatatablePageResult,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

import { mapTagRowToEntity } from "@modules/tags/application/mappers/mapTagRow";
import { TAG_SEARCH_FIELDS } from "@modules/tags/constants";
import { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import { TagRepositoryCreateSchema } from "@modules/tags/domain/zod/tag.schema";
import { ValidationError } from "@shared/domain/errors";
import {
  buildSearchWhereClause,
  DEFAULT_CREATED_AT_ORDER_BY,
  normalizeDatatablePageQuery,
  resolveSearchFields,
} from "@shared/utils/datatableQuery";

/**
 * Type alias for tag create payload.
 */
export type TagCreatePayload = Pick<Tag, "name" | "color"> & {
  modelType?: TagModelTypeValue;
};
/**
 * Type alias for tag update payload.
 */
export type TagUpdatePayload = PartialUpdatePayload<TagCreatePayload>;

/**
 * Defines itag repository.
 */
export interface ITagRepository extends IRepository<
  Tag,
  TagCreatePayload,
  TagUpdatePayload
> {
  listPage(query: DatatablePageQuery): Promise<DatatablePageResult<Tag>>;
  /** List tags scoped to a specific model type, including general-purpose tags. */
  listByModelType(modelType: TagModelTypeValue): Promise<Tag[]>;
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

  async listByModelType(modelType: TagModelTypeValue): Promise<Tag[]> {
    const rows = await this.db.select<Record<string, unknown>>(
      "SELECT * FROM tags WHERE model_type = $1 OR model_type = $2 ORDER BY name ASC",
      [modelType.value, TagModelType.General.value],
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
      console.error("TagRepository.create validation failed", {
        payload,
        error: parseResult.error,
      });
      throw new ValidationError("Tag name is required");
    }

    const parsedData = parseResult.data;

    const name = parsedData.name.trim().toLowerCase();
    if (!name) {
      throw new ValidationError("Tag name is required");
    }

    const id = crypto.randomUUID();
    const modelType = parsedData.modelType ?? TagModelType.General;
    await this.db.execute(
      "INSERT INTO tags (id, name, color, model_type, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      [id, name, parsedData.color ?? null, modelType.value],
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
