import { z } from "zod";

export const SeveritySchema = z.enum(["info", "warning", "success", "error"]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid().nullable(),
  eventId: z.string().uuid().nullable(),
  severity: SeveritySchema,
  title: z.string().min(1),
  body: z.string().min(1),
  isRead: z.boolean(),
  scheduledFor: z.string().datetime().nullable(),
  sentAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateNotificationSchema = NotificationSchema.pick({
  applicationId: true,
  eventId: true,
  severity: true,
  title: true,
  body: true,
  isRead: true,
  scheduledFor: true,
  sentAt: true,
}).partial({
  applicationId: true,
  eventId: true,
  severity: true,
  scheduledFor: true,
  sentAt: true,
});

export type Notification = z.infer<typeof NotificationSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
