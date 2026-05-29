import type { DatatablePageQuery } from "@shared/types";

import { TagSchema } from "@modules/tags/domain/zod/tag.schema";
import {
  type ITagRepository,
  type TagCreatePayload,
  type TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";

const TagNameSchema = TagSchema.pick({ name: true });

/**
 * Implements tag service.
 */
export class TagService {
  constructor(private readonly repository: ITagRepository) {}

  list() {
    return this.repository.list();
  }

  listPage(query: DatatablePageQuery) {
    return this.repository.listPage(query);
  }

  create(payload: TagCreatePayload) {
    const parsedName = TagNameSchema.safeParse({
      name: payload.name.trim(),
    });

    if (!parsedName.success) {
      throw new Error(
        parsedName.error.issues[0]?.message ?? "Invalid tag name",
      );
    }

    return this.repository.create({
      ...payload,
      name: parsedName.data.name,
    });
  }

  update(payload: TagUpdatePayload) {
    let name = payload.name;

    if (name !== undefined) {
      const parsedName = TagNameSchema.safeParse({
        name: name.trim(),
      });

      if (!parsedName.success) {
        throw new Error(
          parsedName.error.issues[0]?.message ?? "Invalid tag name",
        );
      }

      name = parsedName.data.name;
    }

    return this.repository.update({
      ...payload,
      name,
    });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}








