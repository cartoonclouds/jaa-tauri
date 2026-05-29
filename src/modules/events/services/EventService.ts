import { EventSchema } from "@modules/events/domain/zod/event.schema";
import {
  type EventCreatePayload,
  type EventUpdatePayload,
  type IEventRepository,
} from "@modules/events/repositories/EventRepository";

/**
 * Implements event service.
 */
export class EventService {
  constructor(private readonly repository: IEventRepository) {}

  list() {
    return this.repository.list();
  }

  create(payload: EventCreatePayload) {
    const result = EventSchema.pick({
      applicationId: true,
      type: true,
      title: true,
      eventAt: true,
      sortOrder: true,
    })
      .partial({ eventAt: true, sortOrder: true })
      .safeParse(payload);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    return this.repository.create(payload);
  }

  update(payload: EventUpdatePayload) {
    if (
      payload.type !== undefined ||
      payload.title !== undefined ||
      payload.eventAt !== undefined ||
      payload.sortOrder !== undefined
    ) {
      const validatePayload = {
        type: payload.type,
        title: payload.title,
        eventAt: payload.eventAt,
        sortOrder: payload.sortOrder,
      };
      const result = EventSchema.pick({
        type: true,
        title: true,
        eventAt: true,
        sortOrder: true,
      })
        .partial()
        .safeParse(validatePayload);
      if (!result.success) {
        throw new Error(`Validation failed: ${result.error.message}`);
      }
    }
    return this.repository.update(payload);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }
}
