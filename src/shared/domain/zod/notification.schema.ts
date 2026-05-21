import { z } from "zod";

import {
  DateTimeSchema,
  NullableDateTimeSchema,
  NullableUuidSchema,
  UuidSchema,
} from "./fields";

export const SeveritySchema = z.enum(["info", "warning", "success", "error"]);

export const NotificationSchema = z.object({
  id: UuidSchema,
  applicationId: NullableUuidSchema,
  eventId: NullableUuidSchema,
  severity: SeveritySchema,
  title: z.string().min(1),
  body: z.string().min(1),
  isRead: z.boolean(),
  scheduledFor: NullableDateTimeSchema,
  sentAt: NullableDateTimeSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
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
