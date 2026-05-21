import { ref } from "vue";

/**
 * CRUD service contract consumed by the shared composable factory.
 */
export interface CrudService<TItem, TCreatePayload, TUpdatePayload> {
  /** List all items from the backing store. */
  list: () => Promise<TItem[]>;
  /** Create a new item using the provided payload. */
  create: (payload: TCreatePayload) => Promise<unknown>;
  /** Update an existing item using the provided payload. */
  update: (payload: TUpdatePayload) => Promise<unknown>;
  /** Delete an item by identifier. */
  delete: (id: string) => Promise<unknown>;
}

/**
 * CRUD service contract for flows that upsert instead of separate create/update.
 */
export interface UpsertCrudService<TItem, TUpsertPayload> {
  /** List all items from the backing store. */
  list: () => Promise<TItem[]>;
  /** Create or update an item using the provided payload. */
  upsert: (payload: TUpsertPayload) => Promise<unknown>;
  /** Delete an item by identifier. */
  delete: (id: string) => Promise<unknown>;
}

/**
 * Build a reusable CRUD composable around a service implementation.
 */
export function createCrudComposable<TItem, TCreatePayload, TUpdatePayload>(
  service: CrudService<TItem, TCreatePayload, TUpdatePayload>,
) {
  const items = ref<TItem[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function create(payload: TCreatePayload): Promise<void> {
    await service.create(payload);
    await refresh();
  }

  async function update(payload: TUpdatePayload): Promise<void> {
    await service.update(payload);
    await refresh();
  }

  async function remove(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
  }

  void refresh();

  return { items, isLoading, refresh, create, update, remove };
}

/**
 * Build a reusable upsert-oriented CRUD composable around a service implementation.
 */
export function createUpsertCrudComposable<TItem, TUpsertPayload>(
  service: UpsertCrudService<TItem, TUpsertPayload>,
) {
  const items = ref<TItem[]>([]);
  const isLoading = ref(false);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      items.value = await service.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function upsert(payload: TUpsertPayload): Promise<void> {
    await service.upsert(payload);
    await refresh();
  }

  async function remove(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
  }

  void refresh();

  return { items, isLoading, refresh, upsert, remove };
}
