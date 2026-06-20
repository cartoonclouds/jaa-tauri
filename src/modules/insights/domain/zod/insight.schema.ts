import { UuidSchema } from "@shared/domain/zod";
import { z } from "zod";

/**
 * Allowed scope values for insights.
 */
export const InsightScopeSchema = z.enum(["global", "company", "application"]);

/**
 * Runtime schema for insight entities returned by the domain layer.
 */
export const InsightSchema = z.object({
  id: UuidSchema,
  name: z.string().trim().min(1, "Insight name is required").max(120),
  value: z.number().finite("Insight value must be a valid number"),
  scope: InsightScopeSchema,
  recordedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Runtime schema for creating insights.
 */
export const CreateInsightSchema = InsightSchema.pick({
  name: true,
  value: true,
}).extend({
  scope: InsightScopeSchema.default("global"),
  recordedAt: z.date().nullable().optional(),
});

/**
 * Runtime schema for updating insights.
 */
export const UpdateInsightSchema = CreateInsightSchema.partial().extend({
  id: UuidSchema,
});

/**
 * Type alias for insight schema type.
 */
export type InsightSchemaType = z.infer<typeof InsightSchema>;
/**
 * Type alias for create insight schema input.
 */
export type CreateInsightSchemaInput = z.infer<typeof CreateInsightSchema>;
/**
 * Type alias for update insight schema input.
 */
export type UpdateInsightSchemaInput = z.infer<typeof UpdateInsightSchema>;
/**
 * Type alias for insight scope value.
 */
export type InsightScopeValue = z.infer<typeof InsightScopeSchema>;
