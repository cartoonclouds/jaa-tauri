import type { TagModelType as TagModelTypeValue } from "@modules/tags/domain/enums/TagModelType";

import {
  TAG_MODEL_TYPE_VALUES,
  TagModelType,
} from "@modules/tags/domain/enums/TagModelType";
import {
  DateTimeSchema,
  NullableStringSchema,
  UuidSchema,
} from "@shared/domain/zod";
import { z } from "zod";

/**
 * Type guard for `TagModelType` enum instances.
 */
function isTagModelType(value: unknown): value is TagModelTypeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    typeof value.value === "string" &&
    TagModelType.values().some(
      (instance: TagModelTypeValue) => instance.value === value.value,
    )
  );
}

/** Allowed model scope values for tags. */
export const TagModelTypeValueSchema = z.enum(TAG_MODEL_TYPE_VALUES);

/** Runtime schema for tag model type enum instances. */
export const TagModelTypeSchema = z.custom<TagModelTypeValue>(
  isTagModelType,
  "Invalid tag model type",
);

/** Runtime schema for persisted tag entities. */
export const TagSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1),
  color: NullableStringSchema,
  modelType: TagModelTypeSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

/** Runtime schema for creating tags from external input. */
export const CreateTagSchema = z.object({
  name: z.string().min(1),
  color: NullableStringSchema.optional(),
  modelType: TagModelTypeSchema.optional(),
});

/** Repository create payload schema for tag inserts. */
export const TagRepositoryCreateSchema = CreateTagSchema;

/**
 * Type alias for tag.
 */
export type Tag = z.infer<typeof TagSchema>;

/**
 * Type alias for create tag input.
 */
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
