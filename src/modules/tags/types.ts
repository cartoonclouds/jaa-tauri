import type { Tag } from "@modules/tags/domain/entities/Tag";
import type { TagModelType } from "@modules/tags/domain/enums/TagModelType";
import type {
  IPaginatedRepository,
  IRepository,
  PartialUpdatePayload,
} from "@shared/types";

export const TAG_MODEL_TYPES = {
  application: "application",
  company: "company",
  contact: "contact",
  general: "general",
} as const;

export type TagModelTypeValue =
  (typeof TAG_MODEL_TYPES)[keyof typeof TAG_MODEL_TYPES];

/**
 * Type alias for tag create payload.
 */
export type TagCreatePayload = Pick<Tag, "name" | "color"> & {
  modelType?: TagModelType;
};

/**
 * Type alias for tag update payload.
 */
export type TagUpdatePayload = PartialUpdatePayload<TagCreatePayload>;

/**
 * Defines tag repository contract.
 */
export interface ITagRepository
  extends
    IRepository<Tag, TagCreatePayload, TagUpdatePayload>,
    IPaginatedRepository<Tag> {
  /** List tags scoped to a specific model type, including general-purpose tags. */
  listByModelType(modelType: TagModelType): Promise<Tag[]>;
}
