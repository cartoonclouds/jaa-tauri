export interface Event {
  id: string;
  applicationId: string;
  contactId: string | null;
  type: string;
  title: string;
  description: string | null;
  eventAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  applicationId: string;
  contactId?: string | null;
  type: string;
  title: string;
}
