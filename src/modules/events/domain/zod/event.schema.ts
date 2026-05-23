import { INTERACTION_STAGES } from "@modules/events/domain/constants/interactionStage";
import {
  DateTimeSchema,
  NullableDateTimeSchema,
  NullableStringSchema,
  NullableUuidSchema,
  UuidSchema,
} from "@shared/domain/zod/fields";
import { z } from "zod";

export const EventSchema = z.object({
  id: UuidSchema,
  applicationId: UuidSchema,
  contactId: NullableUuidSchema,
  type: z.enum(INTERACTION_STAGES),
  title: z.string().min(1),
  description: NullableStringSchema,
  eventAt: NullableDateTimeSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

export const CreateEventSchema = EventSchema.pick({
  applicationId: true,
  contactId: true,
  type: true,
  title: true,
  description: true,
  eventAt: true,
}).partial({ contactId: true, description: true, eventAt: true });

export const EventRepositoryCreateSchema = CreateEventSchema.pick({
  applicationId: true,
  contactId: true,
  type: true,
  title: true,
});

export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
