import {
  DateTimeSchema,
  NullableStringSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

export const TagSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1),
  color: NullableStringSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateTagSchema = TagSchema.pick({
  name: true,
  color: true,
}).partial({ color: true });

export const TagRepositoryCreateSchema = CreateTagSchema;

/**
 * Type alias for tag.
 */
export type Tag = z.infer<typeof TagSchema>;
/**
 * Type alias for create tag input.
 */
export type CreateTagInput = z.infer<typeof CreateTagSchema>;








