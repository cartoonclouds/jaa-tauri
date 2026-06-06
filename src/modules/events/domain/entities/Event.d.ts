import type { InteractionStage } from "@modules/events/constants";

/**
 * All mutable data fields shared across event read and write models,
 * excluding system-managed identifiers and audit timestamps.
 */
export interface EventBase {
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
  /** Markdown notes scoped to this application stage event. */
  notes: string | null;
  /** Completion timestamp; null means this stage is still pending. */
  eventAt: Date | null;
}

/**
 * Event entity used to track application interactions.
 * Extends {@link EventBase} with system-managed fields.
 */
export interface Event extends EventBase {
  /** Unique application-event link identifier. */
  id: string;
  /** Creation timestamp. */
  createdAt: Date;
  /** Last update timestamp. */
  updatedAt: Date;
}

/**
 * Input required to create an event.
 * Derived from {@link EventBase}: `applicationId`, `type`, and `title` are
 * required; all other base fields are optional.
 */
export type CreateEventInput = Pick<
  EventBase,
  "applicationId" | "type" | "title"
> &
  Partial<Omit<EventBase, "applicationId" | "type" | "title">>;
