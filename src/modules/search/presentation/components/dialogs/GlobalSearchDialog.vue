<script setup lang="ts">
  import type {
    GlobalSearchDataset,
    SearchResult,
    SearchScope,
  } from "@modules/search/types";

  import { useGlobalSearchActionService } from "@modules/search/composables/useGlobalSearchActionService";
  import { useGlobalSearchBuilder } from "@modules/search/composables/useGlobalSearchBuilder";
  import { useGlobalSearchService } from "@modules/search/composables/useGlobalSearchService";
  import {
    SEARCH_JOIN_MODE_OPTIONS,
    SEARCH_OPERATOR_OPTIONS,
    SEARCH_SCOPE_OPTIONS,
  } from "@modules/search/utils/searchUtils";
  import { computed, ref, watch } from "vue";

  interface Props {
    visible: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const globalSearchService = useGlobalSearchService();
  const globalSearchActionService = useGlobalSearchActionService();
  const searchBuilder = useGlobalSearchBuilder();

  const dataset = ref<GlobalSearchDataset>({
    applications: [],
    contacts: [],
    companies: [],
    locations: [],
  });
  const isLoading = ref(false);

  const scopeOptions = SEARCH_SCOPE_OPTIONS;
  const operatorOptions = SEARCH_OPERATOR_OPTIONS;
  const joinModeOptions = SEARCH_JOIN_MODE_OPTIONS;

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  watch(dialogVisible, async (visible, previousVisible) => {
    if (!visible || previousVisible) {
      return;
    }

    searchBuilder.resetBuilder();
    await loadSearchData();
  });

  async function loadSearchData(): Promise<void> {
    isLoading.value = true;

    try {
      dataset.value = await globalSearchService.loadDataset();
    } finally {
      isLoading.value = false;
    }
  }

  const resultSections = computed(() =>
    globalSearchService.buildResultSections({
      dataset: dataset.value,
      conditions: searchBuilder.conditions.value,
      joinMode: searchBuilder.joinMode.value,
    }),
  );

  const applicationResults = computed(() => resultSections.value.applications);
  const contactResults = computed(() => resultSections.value.contacts);
  const companyResults = computed(() => resultSections.value.companies);
  const locationResults = computed(() => resultSections.value.locations);
  const totalResultCount = computed(() => resultSections.value.totalCount);
  const { joinMode, conditions, hasActiveQuery } = searchBuilder;
  const { getFieldOptions, onScopeChange, addCondition, removeCondition } =
    searchBuilder;

  async function onResultSelect(result: SearchResult): Promise<void> {
    dialogVisible.value = false;
    await globalSearchActionService.handleResultSelection(result);
  }
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :draggable="true"
    :block-scroll="true"
    header="Advanced Search"
    class="w-[95vw] max-w-6xl"
  >
    <div class="space-y-4 p-2 md:p-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold">Search Builder</h2>
          <p class="text-sm text-flow-muted">
            Build filters across applications, contacts, companies, and
            locations.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm text-flow-muted">Condition mode</label>
          <Select
            v-model="joinMode"
            :options="joinModeOptions"
            option-label="label"
            option-value="value"
            class="min-w-36"
          />
        </div>
      </div>

      <div class="space-y-3 rounded-flow-md border border-flow-border p-3">
        <div
          v-for="condition in conditions"
          :key="condition.id"
          class="grid gap-2 md:grid-cols-[180px_180px_160px_1fr_auto]"
        >
          <Select
            :model-value="condition.scope"
            :options="scopeOptions"
            option-label="label"
            option-value="value"
            @update:model-value="
              (value) => onScopeChange(condition.id, value as SearchScope)
            "
          />

          <Select
            v-model="condition.field"
            :options="getFieldOptions(condition.scope)"
            option-label="label"
            option-value="value"
          />

          <Select
            v-model="condition.operator"
            :options="operatorOptions"
            option-label="label"
            option-value="value"
          />

          <InputText
            v-model="condition.value"
            placeholder="Enter search value"
            fluid
          />

          <Button
            type="button"
            severity="secondary"
            text
            rounded
            aria-label="Remove condition"
            @click="removeCondition(condition.id)"
          >
            <Icon name="heroicons:trash" class="h-4 w-4" />
          </Button>
        </div>

        <div class="flex justify-end">
          <Button type="button" severity="secondary" @click="addCondition">
            <Icon name="heroicons:plus" class="h-4 w-4" />
            <span>Add condition</span>
          </Button>
        </div>
      </div>

      <div
        v-if="isLoading"
        class="rounded-flow-md border border-flow-border p-4 text-sm text-flow-muted"
      >
        Loading searchable data...
      </div>

      <div
        v-else-if="!hasActiveQuery"
        class="rounded-flow-md border border-flow-border p-4 text-sm text-flow-muted"
      >
        Add at least one condition value to see results.
      </div>

      <div v-else class="space-y-4">
        <div class="text-sm text-flow-muted">
          {{ String(totalResultCount) }} result(s)
        </div>

        <div
          v-if="applicationResults.length > 0"
          class="rounded-flow-md border border-flow-border"
        >
          <div class="border-b border-flow-border p-3 text-sm font-semibold">
            Applications
          </div>
          <button
            v-for="result in applicationResults"
            :key="result.id"
            type="button"
            class="block w-full border-b border-flow-border px-3 py-3 text-left last:border-b-0 hover:bg-surface-50"
            @click="onResultSelect(result)"
          >
            <div class="font-medium">{{ result.title }}</div>
            <div class="text-xs text-flow-muted">{{ result.subtitle }}</div>
            <div v-if="result.detail" class="text-xs text-flow-muted">
              {{ result.detail }}
            </div>
          </button>
        </div>

        <div
          v-if="contactResults.length > 0"
          class="rounded-flow-md border border-flow-border"
        >
          <div class="border-b border-flow-border p-3 text-sm font-semibold">
            Contacts
          </div>
          <button
            v-for="result in contactResults"
            :key="result.id"
            type="button"
            class="block w-full border-b border-flow-border px-3 py-3 text-left last:border-b-0 hover:bg-surface-50"
            @click="onResultSelect(result)"
          >
            <div class="font-medium">{{ result.title }}</div>
            <div class="text-xs text-flow-muted">{{ result.subtitle }}</div>
            <div v-if="result.detail" class="text-xs text-flow-muted">
              {{ result.detail }}
            </div>
          </button>
        </div>

        <div
          v-if="companyResults.length > 0"
          class="rounded-flow-md border border-flow-border"
        >
          <div class="border-b border-flow-border p-3 text-sm font-semibold">
            Companies
          </div>
          <button
            v-for="result in companyResults"
            :key="result.id"
            type="button"
            class="block w-full border-b border-flow-border px-3 py-3 text-left last:border-b-0 hover:bg-surface-50"
            @click="onResultSelect(result)"
          >
            <div class="font-medium">{{ result.title }}</div>
            <div class="text-xs text-flow-muted">{{ result.subtitle }}</div>
            <div v-if="result.detail" class="text-xs text-flow-muted">
              {{ result.detail }}
            </div>
          </button>
        </div>

        <div
          v-if="locationResults.length > 0"
          class="rounded-flow-md border border-flow-border"
        >
          <div class="border-b border-flow-border p-3 text-sm font-semibold">
            Locations
          </div>
          <button
            v-for="result in locationResults"
            :key="result.id"
            type="button"
            class="block w-full border-b border-flow-border px-3 py-3 text-left last:border-b-0 hover:bg-surface-50"
            @click="onResultSelect(result)"
          >
            <div class="font-medium">{{ result.title }}</div>
            <div class="text-xs text-flow-muted">{{ result.subtitle }}</div>
            <div v-if="result.detail" class="text-xs text-flow-muted">
              {{ result.detail }}
            </div>
          </button>
        </div>

        <div
          v-if="totalResultCount === 0"
          class="rounded-flow-md border border-flow-border p-4 text-sm text-flow-muted"
        >
          No records match your current search conditions.
        </div>
      </div>
    </div>
  </Dialog>
</template>
