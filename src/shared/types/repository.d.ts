/**
 * Generic repository contract for CRUD-style persistence layers.
 */

/**
 * Identifier-bearing payload shape.
 */
export interface WithId<TId = string> {
  /** Identifier of the entity to mutate. */
  id: TId;
}

/**
 * Generic create payload shape based on selected entity fields.
 */
export type EntityCreatePayload<
  TEntity,
  TKeys extends keyof TEntity,
  TExtra extends object = Record<never, never>,
> = Pick<TEntity, TKeys> & TExtra;

/**
 * Generic partial update payload shape.
 */
export type PartialUpdatePayload<
  TCreatePayload extends object,
  TId = string,
> = Partial<TCreatePayload> & WithId<TId>;

export interface IRepository<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TId = string,
  TCreateResult = string,
> {
  /** List all persisted entities. */
  list(): Promise<TEntity[]>;
  /** Create a new entity from the provided payload. */
  create(payload: TCreatePayload): Promise<TCreateResult>;
  /** Update an existing entity from the provided payload. */
  update(payload: TUpdatePayload): Promise<void>;
  /** Delete an entity by identifier. */
  delete(id: TId): Promise<void>;
}
