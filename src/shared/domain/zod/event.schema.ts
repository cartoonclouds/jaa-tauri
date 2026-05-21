import { z } from "zod";

import {
  DateTimeSchema,
  NullableDateTimeSchema,
  NullableStringSchema,
  NullableUuidSchema,
  UuidSchema,
} from "./fields";

export const EventSchema = z.object({
  id: UuidSchema,
  applicationId: UuidSchema,
  contactId: NullableUuidSchema,
  type: z.string().min(1),
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

export type Event = z.infer<typeof EventSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
