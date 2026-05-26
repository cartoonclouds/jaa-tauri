import { INTERACTION_STAGES } from "@modules/events/domain/constants/interactionStage";
import {
  DateTimeSchema,
  NullableStringSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

export const EventSchema = z.object({
  id: UuidSchema,
  applicationId: UuidSchema,
  type: z.enum(INTERACTION_STAGES),
  title: z.string().min(1),
  description: NullableStringSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateEventSchema = EventSchema.pick({
  applicationId: true,
  type: true,
  title: true,
  description: true,
}).partial({ description: true });

export const EventRepositoryCreateSchema = CreateEventSchema.pick({
  applicationId: true,
  type: true,
  title: true,
});

/**
 * Type alias for event.
 */
export type Event = z.infer<typeof EventSchema>;
/**
 * Type alias for create event input.
 */
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
