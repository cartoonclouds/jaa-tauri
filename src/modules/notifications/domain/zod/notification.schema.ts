import {
  DateTimeSchema,
  NullableDateTimeSchema,
  NullableUuidSchema,
  UuidSchema,
} from "@shared/domain/zod";
import { z } from "zod";

/** Allowed notification severity values. */
export const SeveritySchema = z.enum(["info", "warning", "success", "error"]);

/** Runtime schema for persisted notification entities. */
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

/** Runtime schema for creating notifications from external input. */
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

/** Repository create payload schema for notification inserts. */
export const NotificationRepositoryCreateSchema = z.object({
  applicationId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  severity: SeveritySchema.optional(),
  title: z.string(),
  body: z.string(),
});

/**
 * Type alias for notification.
 */
export type Notification = z.infer<typeof NotificationSchema>;
/**
 * Type alias for create notification input.
 */
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
