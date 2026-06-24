<script setup lang="ts">
  import type { Application } from "@modules/applications";
  import type { Contact } from "@modules/contacts";
  import type { MappableEntity } from "@shared/utils/entityLocationsLeaflet";

  import { useApplication } from "@modules/applications";
  import { useContact } from "@modules/contacts";
  import { createEntityLocationsLeafletManager } from "@shared/utils/entityLocationsLeaflet";
  import { showFailedPromiseToast } from "@shared/utils/toast";
  import { useToast } from "primevue/usetoast";
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from "vue";

  import { ucfirst } from "@/shared/utils/strings";

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

  const { service: contactService } = useContact();
  const { service: applicationService } = useApplication();
  const toast = useToast();
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
        subtitle: ucfirst(contact.type),
        openHref: `/contacts?contactId=${encodeURIComponent(contact.id)}`,
        openLabel: "Open contact",
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
        openHref: `/applications?applicationId=${encodeURIComponent(application.id)}`,
        openLabel: "Open application",
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
    return (
      filteredEntities.value.find(
        (entity) => entity.id === selectedEntityId.value,
      ) ?? filteredEntities.value[0]
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
      const [contactsResult, applicationsResult] = await Promise.allSettled([
        contactService.list(),
        applicationService.list(),
      ]);

      contacts.value =
        contactsResult.status === "fulfilled" ? contactsResult.value : [];
      applications.value =
        applicationsResult.status === "fulfilled"
          ? applicationsResult.value
          : [];

      if (contactsResult.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Contacts map data",
          contactsResult.reason,
        );
      }

      if (applicationsResult.status === "rejected") {
        showFailedPromiseToast(
          toast,
          "Applications map data",
          applicationsResult.reason,
        );
      }

      if (
        contactsResult.status === "rejected" &&
        applicationsResult.status === "rejected"
      ) {
        loadingError.value = "Unable to load map data right now.";
      }
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
    class="flex h-full min-h-0 flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-6"
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

    <div v-else-if="filteredEntities.length" class="min-h-0 gap-4 flex h-full">
      <div
        class="min-h-0 space-y-2 overflow-y-auto pr-1 w-min min-w-1/4 h-full"
      >
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
              {{ ucfirst(entity.subtitle) }}
            </div>
            <div class="truncate text-xs text-slate-500">
              {{ ucfirst(entity.locationText || "No location label") }}
            </div>
          </div>
        </Button>
      </div>

      <div class="flex min-h-0 flex-col space-y-2 grow">
        <h3 class="text-base font-medium text-slate-200">
          {{ selectedEntity?.name }}
        </h3>
        <div
          ref="mapContainer"
          class="h-80 w-full flex-1 rounded-lg border border-slate-700"
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

  :deep(.leaflet-popup-content-wrapper) {
    background: rgb(15 23 42 / 0.96);
    border: 1px solid rgb(51 65 85 / 0.8);
    color: #e2e8f0;
  }

  :deep(.leaflet-popup-tip) {
    background: rgb(15 23 42 / 0.96);
  }

  :deep(.app-map-popup) {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 12rem;
  }

  :deep(.app-map-popup-title) {
    color: #f8fafc;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.25rem;
  }

  :deep(.app-map-popup-subtitle) {
    color: #94a3b8;
    font-size: 0.75rem;
    line-height: 1.05rem;
  }

  :deep(.app-map-popup-location) {
    color: #cbd5e1;
    font-size: 0.75rem;
    line-height: 1.05rem;
  }

  :deep(.app-map-popup-link) {
    color: #34d399;
    display: inline-flex;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.35rem;
    text-decoration: none;
    width: fit-content;
  }

  :deep(.app-map-popup-link:hover),
  :deep(.app-map-popup-link:focus-visible) {
    color: #6ee7b7;
    text-decoration: underline;
  }
</style>
