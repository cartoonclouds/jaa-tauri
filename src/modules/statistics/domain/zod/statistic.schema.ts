import { UuidSchema } from "@shared/domain/zod/fields";
import { z } from "zod";

/**
 * Allowed scope values for statistics.
 */
export const StatisticScopeSchema = z.enum([
  "global",
  "company",
  "application",
]);

/**
 * Runtime schema for statistic entities returned by the domain layer.
 */
export const StatisticSchema = z.object({
  id: UuidSchema,
  name: z.string().trim().min(1, "Statistic name is required").max(120),
  value: z.number().finite("Statistic value must be a valid number"),
  scope: StatisticScopeSchema,
  recordedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Runtime schema for creating statistics.
 */
export const CreateStatisticSchema = StatisticSchema.pick({
  name: true,
  value: true,
}).extend({
  scope: StatisticScopeSchema.default("global"),
  recordedAt: z.date().nullable().optional(),
});

/**
 * Runtime schema for updating statistics.
 */
export const UpdateStatisticSchema = CreateStatisticSchema.partial().extend({
  id: UuidSchema,
});

/**
 * Type alias for statistic schema type.
 */
export type StatisticSchemaType = z.infer<typeof StatisticSchema>;
/**
 * Type alias for create statistic schema input.
 */
export type CreateStatisticSchemaInput = z.infer<typeof CreateStatisticSchema>;
/**
 * Type alias for update statistic schema input.
 */
export type UpdateStatisticSchemaInput = z.infer<typeof UpdateStatisticSchema>;
/**
 * Type alias for statistic scope value.
 */
export type StatisticScopeValue = z.infer<typeof StatisticScopeSchema>;








