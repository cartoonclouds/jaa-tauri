import type { TagModelType } from "@modules/tags/domain/enums/TagModelType";

export type { TagModelType };

/**
 * All mutable data fields shared across tag read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface TagBase {
  /** Display name for the tag. */
  name: string;
  /** Optional color associated with the tag. */
  color: string | null;
  /** Model scope this tag belongs to. */
  modelType: TagModelType;
}

/**
 * Tag entity used for labeling and filtering.
 * Extends {@link TagBase} with system-managed fields.
 */
export interface Tag extends TagBase {
  /** Unique tag identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create a tag.
 * Derived from {@link TagBase}: `name` is required; all other base fields
 * are optional.
 */
export type CreateTagInput = Pick<TagBase, "name"> &
  Partial<Omit<TagBase, "name">>;
