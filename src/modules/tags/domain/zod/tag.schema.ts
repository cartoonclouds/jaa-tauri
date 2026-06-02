import {
  DateTimeSchema,
  NullableStringSchema,
  UuidSchema,
} from "@shared/domain/zod";
import { z } from "zod";

/** Runtime schema for persisted tag entities. */
export const TagSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1),
  color: NullableStringSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

/** Runtime schema for creating tags from external input. */
export const CreateTagSchema = TagSchema.pick({
  name: true,
  color: true,
}).partial({ color: true });

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
