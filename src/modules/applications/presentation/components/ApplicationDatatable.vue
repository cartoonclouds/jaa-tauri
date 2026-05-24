<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    DatatableActiveSortOrder,
    DatatableSortOrderInput,
  } from "@shared/types";

  import ApplicationBadge from "@modules/applications/presentation/components/badges/ApplicationBadge.vue";
  import {
    APPLICATION_SEARCH_FIELDS,
    APPLICATION_SORTABLE_FIELDS,
    type ApplicationSearchField,
    type ApplicationSearchFieldOption,
    type ApplicationSortableField,
  } from "@modules/applications/presentation/composables/useApplicationDatatable";

  import ServerDatatable from "@/components/ui/ServerDatatable.vue";

  /**
   * Defines props.
   */
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

  /**
   * Handles on row click.
   */
  function onRowClick(row: unknown): void {
    emit("row-click", row as Application);
  }

  /**
   * Handles on global filter input.
   */
  function onGlobalFilterInput(value: string): void {
    emit("update:global-filter", value);
  }

  /**
   * Handles on search fields input.
   */
  function onSearchFieldsInput(fields: string[]): void {
    emit("update:search-fields", fields as ApplicationSearchField[]);
  }

  /**
   * Handles on page.
   */
  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }

  /**
   * Handles on sort.
   */
  function onSort(event: {
    sortField?: string | null;
    sortOrder?: DatatableSortOrderInput;
  }): void {
    emit("sort", {
      sortField: (event.sortField ?? null) as ApplicationSortableField | null,
      sortOrder: event.sortOrder,
    });
  }
</script>

<template>
  <ServerDatatable
    :items="props.items"
    :is-loading="props.isLoading"
    :global-filter="props.globalFilter"
    :search-fields="props.searchFields"
    :search-field-options="props.searchFieldOptions"
    :search-field-allowlist="APPLICATION_SEARCH_FIELDS"
    :rows="props.rows"
    :total-records="props.totalRecords"
    :rows-per-page-options="props.rowsPerPageOptions"
    :paginator-template="props.paginatorTemplate"
    :current-page-report-template="props.currentPageReportTemplate"
    :sort-field="props.sortField"
    :sort-order="props.sortOrder"
    :sortable-fields="APPLICATION_SORTABLE_FIELDS"
    search-placeholder="Search applications"
    @row-click="onRowClick"
    @update:global-filter="onGlobalFilterInput"
    @update:search-fields="onSearchFieldsInput"
    @page="onPage"
    @sort="onSort"
  >
    <Column field="title" header="Title" sortable />
    <Column
      field="status"
      header="Status"
      sortable
      header-class="text-center"
      body-class="text-center"
    >
      <template #body="slotProps">
        <ApplicationBadge
          kind="status"
          :status="(slotProps.data as Application).status"
        />
      </template>
    </Column>
    <Column
      field="eventFlowStatus"
      header="Event Flow"
      sortable
      header-class="text-center"
      body-class="text-center"
    >
      <template #body="slotProps">
        <ApplicationBadge
          kind="event-flow"
          :event-flow-status="(slotProps.data as Application).eventFlowStatus"
        />
      </template>
    </Column>
    <Column
      field="attendanceType"
      header="Attendance"
      header-class="text-center"
      body-class="text-center"
      sortable
    >
      <template #body="slotProps">
        <ApplicationBadge
          v-if="(slotProps.data as Application).attendanceType"
          kind="attendance"
          :attendance-type="(slotProps.data as Application).attendanceType"
        />
        <span v-else class="text-sm text-surface-500">-</span>
      </template>
    </Column>
    <Column
      field="employmentType"
      header="Employment"
      header-class="text-center"
      body-class="text-center"
      sortable
    >
      <template #body="slotProps">
        <ApplicationBadge
          v-if="(slotProps.data as Application).employmentType"
          kind="employment"
          :employment-type="(slotProps.data as Application).employmentType"
        />
        <span v-else class="text-sm text-surface-500">-</span>
      </template>
    </Column>
    <Column field="locationText" header="Location" sortable />
    <Column
      field="priority"
      header="Priority"
      sortable
      header-class="text-center"
      body-class="text-center"
    />
  </ServerDatatable>
</template>
