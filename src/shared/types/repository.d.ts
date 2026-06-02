/**
 * Generic repository contract for CRUD-style persistence layers.
 */
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



