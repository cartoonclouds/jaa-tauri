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
  const error = ref<unknown>(null);

  /** Reset the stored operation error. */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Execute an async operation while normalizing factory-level error state.
   */
  async function runWithErrorState<TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    clearError();

    try {
      return await operation();
    } catch (caughtError) {
      error.value = caughtError;
      throw caughtError;
    }
  }

  /** Reload items from the backing service. */
  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      await runWithErrorState(async () => {
        items.value = await service.list();
      });
    } finally {
      isLoading.value = false;
    }
  }

  /** Create an item and refresh the local collection. */
  async function create(payload: TCreatePayload): Promise<void> {
    await runWithErrorState(async () => {
      await service.create(payload);
      await refresh();
    });
  }

  /** Update an item and refresh the local collection. */
  async function update(payload: TUpdatePayload): Promise<void> {
    await runWithErrorState(async () => {
      await service.update(payload);
      await refresh();
    });
  }

  /** Delete an item and refresh the local collection. */
  async function remove(id: string): Promise<void> {
    await runWithErrorState(async () => {
      await service.delete(id);
      await refresh();
    });
  }

  void refresh();

  return {
    items,
    isLoading,
    error,
    clearError,
    refresh,
    create,
    update,
    remove,
  };
}

/**
 * Build a reusable upsert-oriented CRUD composable around a service implementation.
 */
export function createUpsertCrudComposable<TItem, TUpsertPayload>(
  service: UpsertCrudService<TItem, TUpsertPayload>,
) {
  const items = ref<TItem[]>([]);
  const isLoading = ref(false);
  const error = ref<unknown>(null);

  /** Reset the stored operation error. */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Execute an async operation while normalizing factory-level error state.
   */
  async function runWithErrorState<TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> {
    clearError();

    try {
      return await operation();
    } catch (caughtError) {
      error.value = caughtError;
      throw caughtError;
    }
  }

  /** Reload items from the backing service. */
  async function refresh(): Promise<void> {
    isLoading.value = true;
    try {
      await runWithErrorState(async () => {
        items.value = await service.list();
      });
    } finally {
      isLoading.value = false;
    }
  }

  /** Create or update an item and refresh the local collection. */
  async function upsert(payload: TUpsertPayload): Promise<void> {
    await runWithErrorState(async () => {
      await service.upsert(payload);
      await refresh();
    });
  }

  /** Delete an item and refresh the local collection. */
  async function remove(id: string): Promise<void> {
    await runWithErrorState(async () => {
      await service.delete(id);
      await refresh();
    });
  }

  void refresh();

  return { items, isLoading, error, clearError, refresh, upsert, remove };
}
