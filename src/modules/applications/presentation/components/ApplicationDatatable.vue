<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import { useApplicationDatatable } from "@modules/applications/presentation/composables/useApplicationDatatable";

  interface Props {
    items: Application[];
    isLoading: boolean;
  }

  defineProps<Props>();

  const emit = defineEmits<{
    "row-click": [application: Application];
    "open-details": [application: Application];
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

  const {
    currentPageReportTemplate,
    filters,
    globalFilter,
    globalFilterFields,
    onGlobalFilterInput,
    paginatorTemplate,
    rows,
    rowsPerPageOptions,
  } = useApplicationDatatable();
</script>

<template>
  <DataTable
    v-model:filters="filters"
    :value="items"
    data-key="id"
    :loading="isLoading"
    striped-rows
    filter-display="menu"
    :global-filter-fields="globalFilterFields"
    paginator
    :rows="rows"
    :rows-per-page-options="rowsPerPageOptions"
    :paginator-template="paginatorTemplate"
    :current-page-report-template="currentPageReportTemplate"
    @row-click="onRowClick"
  >
    <template #header>
      <div class="flex justify-end">
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="globalFilter"
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
