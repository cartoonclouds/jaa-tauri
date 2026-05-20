import { ref } from "vue";

export interface CrudService<TItem, TCreatePayload, TUpdatePayload> {
  list: () => Promise<TItem[]>;
  create: (payload: TCreatePayload) => Promise<unknown>;
  update: (payload: TUpdatePayload) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
}

export interface UpsertCrudService<TItem, TUpsertPayload> {
  list: () => Promise<TItem[]>;
  upsert: (payload: TUpsertPayload) => Promise<unknown>;
  delete: (id: string) => Promise<unknown>;
}

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
