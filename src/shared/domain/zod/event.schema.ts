import { z } from "zod";

export const EventSchema = z.object({
  id: z.string().uuid().optional(),
  applicationId: z.string().uuid(),
  type: z.string().min(1),
  title: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Event = z.infer<typeof EventSchema>;
