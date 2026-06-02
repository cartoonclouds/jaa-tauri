import type { DatatablePageQuery } from "@shared/types";

import { TagSchema } from "@modules/tags/domain/zod/tag.schema";
import {
  type ITagRepository,
  type TagCreatePayload,
  type TagUpdatePayload,
} from "@modules/tags/repositories/TagRepository";
import { parseTrimmedWithSchema } from "@shared/utils/zodValidation";

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
    const parsedName = parseTrimmedWithSchema(
      TagNameSchema,
      {
        name: payload.name,
      },
      ["name"],
      {
        fallbackMessage: "Invalid tag name",
        useFirstIssueMessage: true,
      },
    );

    return this.repository.create({
      ...payload,
      name: parsedName.name,
    });
  }

  update(payload: TagUpdatePayload) {
    let name = payload.name;

    if (name !== undefined) {
      const parsedName = parseTrimmedWithSchema(
        TagNameSchema,
        {
          name,
        },
        ["name"],
        {
          fallbackMessage: "Invalid tag name",
          useFirstIssueMessage: true,
        },
      );

      name = parsedName.name;
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
