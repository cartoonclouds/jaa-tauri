<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  interface Props {
    items: Application[];
    isLoading: boolean;
    globalFilter: string;
    rows: number;
    rowsPerPageOptions: number[];
    paginatorTemplate: string;
    currentPageReportTemplate: string;
    totalRecords: number;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    "row-click": [application: Application];
    "open-details": [application: Application];
    "update:global-filter": [value: string];
    page: [event: { page?: number; rows?: number }];
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

  function onPage(event: { page?: number; rows?: number }): void {
    emit("page", event);
  }
</script>

<template>
  <DataTable
    :value="items"
    data-key="id"
    :loading="isLoading"
    striped-rows
    lazy
    paginator
    :rows="rows"
    :total-records="totalRecords"
    :rows-per-page-options="rowsPerPageOptions"
    :paginator-template="paginatorTemplate"
    :current-page-report-template="currentPageReportTemplate"
    @row-click="onRowClick"
    @page="onPage"
  >
    <template #header>
      <div class="flex justify-end">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            :model-value="globalFilter"
            placeholder="Search applications"
            @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
          />
        </IconField>
      </div>
    </template>

    <Column field="title" header="Title" />
    <Column field="status" header="Status" />
    <Column field="locationText" header="Location" />
    <Column field="priority" header="Priority" />
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
