<script setup lang="ts">
  import type { Application } from "@modules/applications";
  import type { Contact } from "@modules/contacts";
  import type { MappableEntity } from "@shared/utils/entityLocationsLeaflet";

  import { useApplicationService } from "@modules/applications";
  import { useContactService } from "@modules/contacts";
  import { createEntityLocationsLeafletManager } from "@shared/utils/entityLocationsLeaflet";
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from "vue";

  /**
   * Supported source groups shown in the map browser.
   */
  type MapEntityType = "contacts" | "applications";

  const sourceOptions = [
    { label: "Contacts", value: "contacts" },
    { label: "Applications", value: "applications" },
  ];

  const selectedSource = ref<MapEntityType>("contacts");
  const searchQuery = ref("");
  const debouncedSearchQuery = ref("");
  const selectedEntityId = ref<string | null>(null);
  const isLoading = ref(false);
  const loadingError = ref<string | null>(null);
  const contacts = ref<Contact[]>([]);
  const applications = ref<Application[]>([]);
  const mapContainer = ref<HTMLDivElement | null>(null);
  const SEARCH_DEBOUNCE_MS = 200;
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const contactService = useContactService();
  const applicationService = useApplicationService();
  const mapManager = createEntityLocationsLeafletManager({
    onError: (message) => {
      loadingError.value = message;
    },
  });

  const contactEntities = computed<MappableEntity[]>(() =>
    contacts.value
      .filter(
        (contact) =>
          typeof contact.locationLat === "number" &&
          typeof contact.locationLng === "number",
      )
      .map((contact) => ({
        id: contact.id,
        name: contact.fullName,
        locationText: contact.locationText,
        locationLat: contact.locationLat,
        locationLng: contact.locationLng,
        subtitle: contact.type,
      })),
  );

  const applicationEntities = computed<MappableEntity[]>(() =>
    applications.value
      .filter(
        (application) =>
          typeof application.locationLat === "number" &&
          typeof application.locationLng === "number",
      )
      .map((application) => ({
        id: application.id,
        name: application.title,
        locationText: application.locationText,
        locationLat: application.locationLat,
        locationLng: application.locationLng,
        subtitle: application.status.toLabel(),
      })),
  );

  const activeEntities = computed<MappableEntity[]>(() => {
    if (selectedSource.value === "contacts") {
      return contactEntities.value;
    }

    return applicationEntities.value;
  });

  const filteredEntities = computed<MappableEntity[]>(() => {
    const query = debouncedSearchQuery.value.trim().toLocaleLowerCase();
    if (!query) {
      return activeEntities.value;
    }

    return activeEntities.value.filter((entity) => {
      const name = entity.name.toLocaleLowerCase();
      const subtitle = entity.subtitle.toLocaleLowerCase();
      const locationText = (entity.locationText ?? "").toLocaleLowerCase();

      return (
        name.includes(query) ||
        subtitle.includes(query) ||
        locationText.includes(query)
      );
    });
  });

  const selectedEntity = computed<MappableEntity | null>(() => {
    if (!selectedEntityId.value) {
      return filteredEntities.value[0] ?? null;
    }

    return (
      filteredEntities.value.find(
        (entity) => entity.id === selectedEntityId.value,
      ) ??
      filteredEntities.value[0] ??
      null
    );
  });

  const selectedSourceLabel = computed(() =>
    selectedSource.value === "contacts" ? "contacts" : "applications",
  );

  const withCoordinatesCount = computed(() => activeEntities.value.length);
  const filteredCount = computed(() => filteredEntities.value.length);
  const hasSearchQuery = computed(() => searchQuery.value.trim().length > 0);

  /**
   * Load all entities needed to build map markers.
   */
  async function loadEntities(): Promise<void> {
    isLoading.value = true;
    loadingError.value = null;

    try {
      const [contactsResult, applicationsResult] = await Promise.all([
        contactService.list(),
        applicationService.list(),
      ]);
      contacts.value = contactsResult;
      applications.value = applicationsResult;
    } catch {
      loadingError.value = "Unable to load map data right now.";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Render or refresh markers on the Leaflet map.
   */
  async function syncLeafletMap(): Promise<void> {
    const container = mapContainer.value;
    if (!container) {
      return;
    }

    await mapManager.initialize(container);
    mapManager.render(filteredEntities.value, (entityId) => {
      selectedEntityId.value = entityId;
    });
  }

  /**
   * Reset search state and clear any pending debounce timer.
   */
  function clearSearch(): void {
    searchQuery.value = "";
    debouncedSearchQuery.value = "";
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
  }

  onMounted(async () => {
    await loadEntities();
    await nextTick();
    await syncLeafletMap();
  });

  onBeforeUnmount(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    mapManager.destroy();
  });

  watch(searchQuery, (query) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = query;
      searchDebounceTimer = null;
    }, SEARCH_DEBOUNCE_MS);
  });

  watch(filteredEntities, (entities) => {
    selectedEntityId.value = entities[0]?.id ?? null;
  });

  watch(filteredEntities, async () => {
    await nextTick();
    await syncLeafletMap();
  });

  watch(selectedEntityId, () => {
    mapManager.focusSelectedEntity(selectedEntityId.value, true);
  });
</script>

<template>
  <section
    class="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6"
  >
    <div
      class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <h2 class="text-xl font-semibold text-slate-100">
          Location map browser
        </h2>
        <p class="text-sm text-slate-300">
          Explore {{ selectedSourceLabel }} with saved coordinates.
        </p>
      </div>

      <SelectButton
        v-model="selectedSource"
        :options="sourceOptions"
        option-label="label"
        option-value="value"
        aria-label="Location source"
      />
    </div>

    <div class="relative w-full md:max-w-sm">
      <InputText
        v-model="searchQuery"
        class="w-full pr-10"
        type="text"
        placeholder="Search by name, type, or location"
        aria-label="Search map entities"
      />

      <Button
        v-if="hasSearchQuery"
        text
        rounded
        severity="secondary"
        aria-label="Clear search"
        class="absolute! right-1 top-1/2 -translate-y-1/2"
        @click="clearSearch"
      >
        <Icon name="heroicons:x-mark" class="h-4 w-4" />
      </Button>
    </div>

    <div class="text-sm text-slate-300">
      Showing {{ filteredCount }} of {{ withCoordinatesCount }}
      {{ selectedSourceLabel }} with coordinates.
    </div>

    <Message v-if="loadingError" severity="error" :closable="false">
      {{ loadingError }}
    </Message>

    <div
      v-else-if="isLoading"
      class="rounded-lg border border-slate-700 p-4 text-slate-300"
    >
      Loading map data...
    </div>

    <div
      v-else-if="filteredEntities.length"
      class="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div class="max-h-120 space-y-2 overflow-y-auto pr-1">
        <Button
          v-for="entity in filteredEntities"
          :key="entity.id"
          class="w-full text-left"
          :severity="selectedEntity?.id === entity.id ? 'primary' : 'secondary'"
          text
          @click="selectedEntityId = entity.id"
        >
          <div class="w-full truncate text-left">
            <div class="truncate font-medium">{{ entity.name }}</div>
            <div class="truncate text-xs text-slate-400">
              {{ entity.subtitle }}
            </div>
            <div class="truncate text-xs text-slate-500">
              {{ entity.locationText || "No location label" }}
            </div>
          </div>
        </Button>
      </div>

      <div class="space-y-2">
        <h3 class="text-base font-medium text-slate-200">
          {{ selectedEntity?.name }}
        </h3>
        <div
          ref="mapContainer"
          class="h-120 w-full rounded-lg border border-slate-700"
        />
      </div>
    </div>

    <div v-else class="rounded-lg border border-slate-700 p-4 text-slate-300">
      <span v-if="withCoordinatesCount">
        No {{ selectedSourceLabel }} match your search.
      </span>
      <span v-else>No {{ selectedSourceLabel }} have coordinates yet.</span>
    </div>
  </section>
</template>

<style scoped>
  :deep(.app-map-pin-icon) {
    align-items: center;
    display: inline-flex;
    height: 22px;
    justify-content: center;
    margin-left: -11px;
    margin-top: -11px;
    width: 22px;
  }

  :deep(.app-map-pin-dot) {
    background: #10b981;
    border: 2px solid #ffffff;
    border-radius: 999px;
    box-shadow: 0 0 0 2px rgb(2 6 23 / 0.35);
    display: block;
    height: 14px;
    width: 14px;
  }

  :deep(.app-map-cluster-icon) {
    align-items: center;
    background: radial-gradient(circle at 30% 30%, #34d399, #0f766e);
    border: 2px solid #ccfbf1;
    border-radius: 999px;
    box-shadow: 0 8px 18px rgb(15 23 42 / 0.3);
    color: #f8fafc;
    display: inline-flex;
    font-size: 0.85rem;
    font-weight: 700;
    height: 40px;
    justify-content: center;
    width: 40px;
  }

  :deep(.app-map-cluster-icon > span) {
    line-height: 1;
  }
</style>
