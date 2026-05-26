import type { InteractionStage } from "@modules/events/domain/constants/interactionStage";

/**
 * Event entity used to track application interactions.
 */
export interface Event {
  /** Unique event identifier. */
  id: string;
  /** Related application identifier. */
  applicationId: string;
  /** Event type identifier. */
  type: InteractionStage;
  /** Event title. */
  title: string;
  /** Free-form event description. */
  description: string | null;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create an event.
 */
export interface CreateEventInput {
  /** Related application identifier. */
  applicationId: string;
  /** Event type identifier. */
  type: InteractionStage;
  /** Event title. */
  title: string;
}
