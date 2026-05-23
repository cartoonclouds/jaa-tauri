<script setup lang="ts">
  import type {
    DatatableActiveSortOrder,
    DatatableSortOrderInput,
  } from "@shared/types";

  import { computed } from "vue";

  import { DEFAULT_DATATABLE_TABLE_STYLE } from "@/shared/utils/datatableQuery";

  /**
   * Search field option rendered by the table header multi-select.
   */
  interface SearchFieldOption {
    label: string;
    value: string;
  }

  /**
   * Props accepted by the reusable server-backed datatable component.
   */
  interface Props {
    items: unknown[];
    isLoading: boolean;
    globalFilter: string;
    searchFields: string[];
    searchFieldOptions: readonly SearchFieldOption[];
    searchFieldAllowlist?: readonly string[];
    rows: number;
    rowsPerPageOptions: number[];
    paginatorTemplate: string;
    currentPageReportTemplate: string;
    totalRecords: number;
    sortField: string | null;
    sortOrder: DatatableActiveSortOrder;
    sortableFields?: readonly string[];
    searchPlaceholder?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    searchPlaceholder: "Search",
    searchFieldAllowlist: () => [],
    sortableFields: () => [],
  });

  const emit = defineEmits<{
    "row-click": [row: unknown];
    "update:global-filter": [value: string];
    "update:search-fields": [value: string[]];
    page: [event: { page?: number; rows?: number }];
    sort: [
      event: { sortField?: string | null; sortOrder?: DatatableSortOrderInput },
    ];
  }>();

  const searchFieldOptions = computed<SearchFieldOption[]>(() => [
    ...props.searchFieldOptions,
  ]);

  const searchFieldsSelectedItemsLabel = computed(() => {
    if (props.searchFieldOptions.length > 0) {
      const allSelected =
        props.searchFields.length === props.searchFieldOptions.length;
      if (allSelected) {
        return "All";
      }
    }

    return "{0} fields";
  });

  const safePaginatorTemplate = computed(() =>
    props.paginatorTemplate
      .split(/\s+/)
      .filter(
        (token) =>
          token.length > 0 &&
          token !== "RowsPerPageDropdown" &&
          token !== "JumpToPageDropdown",
      )
      .join(" "),
  );

  /**
   * Emit row-click with normalized row payload.
   */
  function onRowClick(event: { data: unknown; originalEvent: Event }): void {
    emit("row-click", event.data);
  }

  /**
   * Emit global filter changes.
   */
  function onGlobalFilterInput(value: string): void {
    emit("update:global-filter", value);
  }

  /**
   * Normalize and emit search field selections from the multi-select.
   */
  function onSearchFieldsInput(value: unknown): void {
    const allowedSearchFieldValues =
      props.searchFieldAllowlist.length > 0
        ? new Set<string>(props.searchFieldAllowlist)
        : new Set<string>(
            props.searchFieldOptions.map((option) => option.value),
          );

    const normalized = Array.isArray(value)
      ? value.filter(
          (field): field is string =>
            typeof field === "string" && allowedSearchFieldValues.has(field),
        )
      : [];

    emit("update:search-fields", normalized);
  }

  /**
   * Forward pagination events to the parent.
   */
  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }

  /**
   * Validate and emit sorting events using the allowed sortable fields.
   */
  function onSort(event: {
    sortField?: string | ((item: unknown) => string) | null;
    sortOrder?: DatatableSortOrderInput;
  }): void {
    const allowedSortFieldValues =
      props.sortableFields.length > 0
        ? new Set<string>(props.sortableFields)
        : null;
    const normalizedSortField =
      typeof event.sortField === "string" &&
      (!allowedSortFieldValues || allowedSortFieldValues.has(event.sortField))
        ? event.sortField
        : null;

    emit("sort", {
      sortField: normalizedSortField,
      sortOrder: event.sortOrder,
    });
  }
</script>

<template>
  <DataTable
    :value="props.items"
    data-key="id"
    :loading="props.isLoading"
    show-gridlines
    striped-rows
    lazy
    paginator
    :table-style="DEFAULT_DATATABLE_TABLE_STYLE"
    :rows="props.rows"
    :total-records="props.totalRecords"
    :rows-per-page-options="props.rowsPerPageOptions"
    :paginator-template="safePaginatorTemplate"
    :current-page-report-template="props.currentPageReportTemplate"
    :sort-field="props.sortField ?? undefined"
    :sort-order="props.sortOrder ?? undefined"
    @row-click="onRowClick"
    @page="onPage"
    @sort="onSort"
  >
    <template #header>
      <div class="flex justify-end">
        <InputGroup class="w-full max-w-2xl">
          <InputGroupAddon>
            <Icon name="heroicons:magnifying-glass" class="h-4 w-4" />
          </InputGroupAddon>
          <InputText
            :model-value="props.globalFilter"
            :placeholder="props.searchPlaceholder"
            aria-label="Table search"
            class="w-full"
            @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
          />
          <MultiSelect
            :model-value="props.searchFields"
            :options="searchFieldOptions"
            option-label="label"
            option-value="value"
            placeholder="Search fields"
            aria-label="Search fields"
            :max-selected-labels="1"
            :selected-items-label="searchFieldsSelectedItemsLabel"
            class="w-44 shrink-0"
            @update:model-value="onSearchFieldsInput"
          />
        </InputGroup>
      </div>
    </template>

    <template v-if="$slots.paginatorcontainer" #paginatorcontainer="slotProps">
      <slot name="paginatorcontainer" v-bind="slotProps" />
    </template>

    <template v-if="$slots.paginatorstart" #paginatorstart>
      <slot name="paginatorstart" />
    </template>

    <template v-if="$slots.paginatorend" #paginatorend>
      <slot name="paginatorend" />
    </template>

    <slot />

    <template #empty> No records found. </template>
    <template #loading> Loading records. Please wait. </template>
  </DataTable>
</template>

<style scoped>
  :deep(.p-datatable-tbody > tr:hover) {
    cursor: pointer;
  }
</style>
