export interface IRepository<
  TEntity,
  TCreatePayload,
  TUpdatePayload,
  TId = string,
  TCreateResult = string,
> {
  list(): Promise<TEntity[]>;
  create(payload: TCreatePayload): Promise<TCreateResult>;
  update(payload: TUpdatePayload): Promise<void>;
  delete(id: TId): Promise<void>;
}
