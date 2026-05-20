import { z } from "zod";

export const NotificationSchema = z.object({
  id: z.string().uuid().optional(),
  eventId: z.string().uuid().nullable(),
  type: z.string().min(1),
  message: z.string().min(1),
  read: z.boolean().default(false),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
