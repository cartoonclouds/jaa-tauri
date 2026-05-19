export interface Notification {
  id: string;
  applicationId: string | null;
  eventId: string | null;
  severity: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  isRead: boolean;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationInput {
  applicationId?: string | null;
  eventId?: string | null;
  severity?: Notification["severity"];
  title: string;
  body: string;
}
