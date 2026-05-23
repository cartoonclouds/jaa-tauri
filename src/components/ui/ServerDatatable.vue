<script setup lang="ts">
  import type {
    DatatableActiveSortOrder,
    DatatableSortOrderInput,
  } from "@shared/types";

  import { DEFAULT_DATATABLE_TABLE_STYLE } from "@shared/utils/datatableStyles";
  import { computed } from "vue";

  interface SearchFieldOption {
    label: string;
    value: string;
  }

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

  function onRowClick(event: { data: unknown; originalEvent: Event }): void {
    emit("row-click", event.data);
  }

  function onGlobalFilterInput(value: string): void {
    emit("update:global-filter", value);
  }

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

  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }

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
    :paginator-template="props.paginatorTemplate"
    :current-page-report-template="props.currentPageReportTemplate"
    :sort-field="props.sortField ?? undefined"
    :sort-order="props.sortOrder ?? undefined"
    @row-click="onRowClick"
    @page="onPage"
    @sort="onSort"
  >
    <template #header>
      <div class="flex flex-wrap justify-end gap-3">
        <MultiSelect
          :model-value="props.searchFields"
          :options="searchFieldOptions"
          option-label="label"
          option-value="value"
          placeholder="Search fields"
          class="min-w-13rem"
          @update:model-value="onSearchFieldsInput"
        />
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            :model-value="props.globalFilter"
            :placeholder="props.searchPlaceholder"
            @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
          />
        </IconField>
      </div>
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
