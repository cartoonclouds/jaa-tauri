export interface Event {
  id: string;
  applicationId: string;
  contactId: string | null;
  type: string;
  title: string;
  description: string | null;
  eventAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventInput {
  applicationId: string;
  contactId?: string | null;
  type: string;
  title: string;
}
