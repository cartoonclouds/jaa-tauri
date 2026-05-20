export interface Notification {
  id: string;
  applicationId: string | null;
  eventId: string | null;
  severity: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  isRead: boolean;
  scheduledFor: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  applicationId?: string | null;
  eventId?: string | null;
  severity?: Notification["severity"];
  title: string;
  body: string;
}
