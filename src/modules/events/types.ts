import type { InteractionStage } from "@modules/events/constants";
import type { Event } from "@modules/events/domain/entities/Event";
import type { IRepository } from "@shared/types";

/**
 * Event create payload.
 */
export interface EventCreatePayload {
  applicationId: string;
  type: InteractionStage;
  title: string;
  description: string | null;
  notes?: string | null;
  eventAt?: string | null;
  sortOrder?: number;
}

/**
 * Event update payload.
 */
export interface EventUpdatePayload {
  id: string;
  type?: InteractionStage;
  title?: string;
  description?: string | null;
  notes?: string | null;
  eventAt?: string | null;
  sortOrder?: number;
}

/**
 * Defines event repository contract.
 */
export interface IEventRepository extends IRepository<
  Event,
  EventCreatePayload,
  EventUpdatePayload
> {}
