<script setup lang="ts">
  import type {
    GlobalSearchDataset,
    SearchCondition,
    SearchResult,
  } from "@modules/search/types";

  import { useGlobalSearchService } from "@modules/search/composables/useGlobalSearchService";
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";

  const emit = defineEmits<{
    select: [result: SearchResult];
  }>();

  const globalSearchService = useGlobalSearchService();
  const quickSearchQuery = ref("");
  const quickSearchResults = ref<SearchResult[]>([]);
  const showQuickSearchDropdown = ref(false);
  const isQuickSearchLoading = ref(false);
  const hasQuickSearchDatasetLoaded = ref(false);
  const quickSearchDataset = ref<GlobalSearchDataset>({
    applications: [],
    contacts: [],
    companies: [],
    locations: [],
  });

  let quickSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  onMounted(() => {
    void ensureQuickSearchDatasetLoaded();
  });

  onBeforeUnmount(() => {
    clearQuickSearchTimeout();
  });

  watch(quickSearchQuery, (value) => {
    const query = value.trim();

    clearQuickSearchTimeout();

    if (query.length < 2) {
      quickSearchResults.value = [];
      showQuickSearchDropdown.value = false;
      return;
    }

    quickSearchTimeout = setTimeout(() => {
      void runQuickSearch(query);
    }, 300);
  });

  function clearQuickSearchTimeout(): void {
    if (quickSearchTimeout !== null) {
      clearTimeout(quickSearchTimeout);
      quickSearchTimeout = null;
    }
  }

  function buildQuickSearchConditions(query: string): SearchCondition[] {
    return [
      {
        id: "quick-applications",
        scope: "applications",
        field: "title",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-applications-location",
        scope: "applications",
        field: "locationText",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-applications-description",
        scope: "applications",
        field: "description",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-contacts",
        scope: "contacts",
        field: "fullName",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-contacts-email",
        scope: "contacts",
        field: "email",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-contacts-location",
        scope: "contacts",
        field: "locationText",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-companies",
        scope: "companies",
        field: "name",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-companies-industry",
        scope: "companies",
        field: "industry",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-companies-location",
        scope: "companies",
        field: "locationText",
        operator: "contains",
        value: query,
      },
      {
        id: "quick-locations",
        scope: "locations",
        field: "locationText",
        operator: "contains",
        value: query,
      },
    ];
  }

  async function ensureQuickSearchDatasetLoaded(): Promise<void> {
    if (hasQuickSearchDatasetLoaded.value) {
      return;
    }

    quickSearchDataset.value = await globalSearchService.loadDataset();
    hasQuickSearchDatasetLoaded.value = true;
  }

  async function runQuickSearch(query: string): Promise<void> {
    isQuickSearchLoading.value = true;

    try {
      await ensureQuickSearchDatasetLoaded();

      const sections = await globalSearchService.buildResultSections({
        dataset: quickSearchDataset.value,
        conditions: buildQuickSearchConditions(query),
        joinMode: "any",
      });

      quickSearchResults.value = [
        ...sections.applications,
        ...sections.contacts,
        ...sections.companies,
        ...sections.locations,
      ].slice(0, 8);

      showQuickSearchDropdown.value = true;
    } finally {
      isQuickSearchLoading.value = false;
    }
  }

  function onQuickSearchResultClick(result: SearchResult) {
    showQuickSearchDropdown.value = false;
    quickSearchQuery.value = "";
    quickSearchResults.value = [];
    emit("select", result);
  }

  function onQuickSearchSubmit(): void {
    if (quickSearchResults.value.length === 0) {
      return;
    }

    onQuickSearchResultClick(quickSearchResults.value[0]);
  }
</script>

<template>
  <section class="relative mx-auto w-full">
    <div class="relative">
      <InputText
        v-model="quickSearchQuery"
        class="w-full"
        placeholder="Quick search applications, contacts, companies, locations..."
        @focus="showQuickSearchDropdown = quickSearchResults.length > 0"
        @keydown.enter.prevent="onQuickSearchSubmit"
      />
      <Icon
        :name="
          isQuickSearchLoading
            ? 'heroicons:arrow-path'
            : 'heroicons:magnifying-glass'
        "
        :class="[
          'pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
          isQuickSearchLoading && 'animate-spin',
        ]"
      />
    </div>

    <div
      v-if="showQuickSearchDropdown"
      class="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl"
    >
      <div v-if="isQuickSearchLoading" class="px-4 py-3 text-sm text-slate-300">
        Searching...
      </div>

      <div
        v-else-if="quickSearchResults.length === 0"
        class="px-4 py-3 text-sm text-slate-300"
      >
        No matches found.
      </div>

      <button
        v-for="result in quickSearchResults"
        v-else
        :key="result.id"
        type="button"
        class="block w-full border-b border-slate-800 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800 hover:cursor-pointer"
        @mousedown.prevent
        @click="onQuickSearchResultClick(result)"
      >
        <div class="text-sm font-medium text-slate-100">{{ result.title }}</div>
        <div class="text-xs text-slate-400">{{ result.subtitle }}</div>
      </button>
    </div>
  </section>
</template>
