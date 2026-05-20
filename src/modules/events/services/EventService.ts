import {
  type EventCreatePayload,
  type EventUpdatePayload,
  type IEventRepository,
} from "@modules/events/repositories/EventRepository";

export class EventService {
  constructor(private readonly repository: IEventRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: EventCreatePayload) {
    if (!payload.applicationId.trim()) {
      throw new Error("Event applicationId is required");
    }
    if (!payload.title.trim()) {
      throw new Error("Event title is required");
    }
    return this.repository.create({ ...payload, title: payload.title.trim() });
  }

  update(payload: EventUpdatePayload) {
    if (payload.title !== undefined && !payload.title.trim()) {
      throw new Error("Event title cannot be empty");
    }
    return this.repository.update({ ...payload, title: payload.title?.trim() });
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
