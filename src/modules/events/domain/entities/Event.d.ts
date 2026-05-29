import type { InteractionStage } from "@modules/events/constants";

/**
 * Event entity used to track application interactions.
 */
export interface Event {
  /** Unique application-event link identifier. */
  id: string;
  /** Related application identifier. */
  applicationId: string;
  /** Display order of this flow step within an application timeline. */
  sortOrder: number;
  /** Event type identifier. */
  type: InteractionStage;
  /** Event title. */
  title: string;
  /** Free-form event description. */
  description: string | null;
  /** Completion timestamp; null means this stage is still pending. */
  eventAt: Date | null;
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
