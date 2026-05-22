<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    DatatableActiveSortOrder,
    DatatableSortOrderInput,
  } from "@shared/types";

  import {
    APPLICATION_SORTABLE_FIELDS,
    type ApplicationSearchField,
    type ApplicationSearchFieldOption,
    type ApplicationSortableField,
  } from "@modules/applications/presentation/composables/useApplicationDatatable";

  interface Props {
    items: Application[];
    isLoading: boolean;
    globalFilter: string;
    searchFields: ApplicationSearchField[];
    searchFieldOptions: ApplicationSearchFieldOption[];
    rows: number;
    rowsPerPageOptions: number[];
    paginatorTemplate: string;
    currentPageReportTemplate: string;
    totalRecords: number;
    sortField: ApplicationSortableField | null;
    sortOrder: DatatableActiveSortOrder;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "row-click": [application: Application];
    "open-details": [application: Application];
    "update:global-filter": [value: string];
    "update:search-fields": [value: ApplicationSearchField[]];
    page: [event: { page?: number; rows?: number }];
    sort: [
      event: {
        sortField?: ApplicationSortableField | null;
        sortOrder?: DatatableSortOrderInput;
      },
    ];
  }>();

  function onRowClick(event: {
    data: Application;
    originalEvent: Event;
  }): void {
    emit("row-click", event.data);
  }

  function onOpenDetails(application: Application): void {
    emit("open-details", application);
  }

  function onGlobalFilterInput(value: string): void {
    emit("update:global-filter", value);
  }

  function onSearchFieldsInput(value: unknown): void {
    const allowedValues = new Set<string>(
      props.searchFieldOptions.map((option) => option.value),
    );

    const normalized = Array.isArray(value)
      ? value.filter(
          (field): field is ApplicationSearchField =>
            typeof field === "string" && allowedValues.has(field),
        )
      : [];

    emit("update:search-fields", normalized);
  }

  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }

  function onSort(event: {
    sortField?: string | ((item: Application) => string) | null;
    sortOrder?: DatatableSortOrderInput;
  }): void {
    const sortableFields = new Set<string>(APPLICATION_SORTABLE_FIELDS);
    const sortField =
      typeof event.sortField === "string" && sortableFields.has(event.sortField)
        ? (event.sortField as ApplicationSortableField)
        : null;

    emit("sort", {
      sortField,
      sortOrder: event.sortOrder,
    });
  }
</script>

<template>
  <DataTable
    :value="props.items"
    data-key="id"
    :loading="props.isLoading"
    striped-rows
    lazy
    paginator
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
          :options="props.searchFieldOptions"
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
            placeholder="Search applications"
            @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
          />
        </IconField>
      </div>
    </template>

    <Column field="title" header="Title" sortable />
    <Column field="status" header="Status" sortable />
    <Column field="locationText" header="Location" sortable />
    <Column field="priority" header="Priority" sortable />
    <Column header="Actions">
      <template #body="slotProps">
        <Button
          text
          rounded
          class="h-9 w-9 border border-transparent text-slate-600 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Open application drawer"
          @click.stop="onOpenDetails(slotProps.data as Application)"
        >
          <Icon name="heroicons:eye" class="h-5 w-5" />
        </Button>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
  :deep(.p-datatable-tbody > tr:hover) {
    cursor: pointer;
  }
</style>
