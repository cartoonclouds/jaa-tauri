<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";
  import type {
    DatatableActiveSortOrder,
    DatatableSortOrderInput,
  } from "@shared/types";

  import {
    APPLICATION_SEARCH_FIELDS,
    APPLICATION_SORTABLE_FIELDS,
    type ApplicationSearchField,
    type ApplicationSearchFieldOption,
    type ApplicationSortableField,
  } from "@modules/applications/presentation/composables/useApplicationDatatable";
  import {
    formatApplicationAttendanceTypeLabel as formatAttendanceTypeLabel,
    formatApplicationEmploymentTypeLabel as formatEmploymentTypeLabel,
    formatApplicationStatusLabel as formatStatusLabel,
    getApplicationAttendanceTypeClass as getAttendanceTypeClass,
    getApplicationEmploymentTypeClass as getEmploymentTypeClass,
    getApplicationStatusClass as getStatusClass,
  } from "@modules/applications/presentation/utils/applicationVisualTokens";

  import ServerDatatable from "@/components/ui/ServerDatatable.vue";

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

  function onRowClick(row: unknown): void {
    emit("row-click", row as Application);
  }

  function onOpenDetails(application: Application): void {
    emit("open-details", application);
  }

  function onGlobalFilterInput(value: string): void {
    emit("update:global-filter", value);
  }

  function onSearchFieldsInput(fields: string[]): void {
    emit("update:search-fields", fields as ApplicationSearchField[]);
  }

  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }

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
        <span
          class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="getStatusClass((slotProps.data as Application).status)"
        >
          {{ formatStatusLabel((slotProps.data as Application).status) }}
        </span>
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
        <span
          v-if="(slotProps.data as Application).attendanceType"
          class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="
            getAttendanceTypeClass(
              (slotProps.data as Application).attendanceType,
            )
          "
        >
          {{
            formatAttendanceTypeLabel(
              (slotProps.data as Application).attendanceType,
            )
          }}
        </span>
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
        <span
          v-if="(slotProps.data as Application).employmentType"
          class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="
            getEmploymentTypeClass(
              (slotProps.data as Application).employmentType,
            )
          "
        >
          {{
            formatEmploymentTypeLabel(
              (slotProps.data as Application).employmentType,
            )
          }}
        </span>
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
    <Column
      header="Actions"
      header-class="text-center"
      body-class="text-center"
    >
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
  </ServerDatatable>
</template>

<style scoped>
  :deep(.p-datatable .p-datatable-thead > tr > th),
  :deep(.p-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
  }
</style>
