import { EventSchema } from "@modules/events/domain/zod/event.schema";
import {
  type EventCreatePayload,
  type EventUpdatePayload,
  type IEventRepository,
} from "@modules/events/repositories/EventRepository";
import { parseWithSchema } from "@shared/utils/zodValidation";

/**
 * Implements event service.
 */
export class EventService {
  constructor(private readonly repository: IEventRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: EventCreatePayload) {
    parseWithSchema(
      EventSchema.pick({
        applicationId: true,
        type: true,
        title: true,
        notes: true,
        eventAt: true,
        sortOrder: true,
      }).partial({ notes: true, eventAt: true, sortOrder: true }),
      payload,
    );
    return this.repository.create(payload);
  }

  update(payload: EventUpdatePayload) {
    if (
      payload.type !== undefined ||
      payload.title !== undefined ||
      payload.notes !== undefined ||
      payload.eventAt !== undefined ||
      payload.sortOrder !== undefined
    ) {
      const validatePayload = {
        type: payload.type,
        title: payload.title,
        notes: payload.notes,
        eventAt: payload.eventAt,
        sortOrder: payload.sortOrder,
      };
      parseWithSchema(
        EventSchema.pick({
          type: true,
          title: true,
          notes: true,
          eventAt: true,
          sortOrder: true,
        }).partial(),
        validatePayload,
      );
    }
    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
