import { z } from "zod";

export const EventSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  contactId: z.string().uuid().nullable(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  eventAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
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
