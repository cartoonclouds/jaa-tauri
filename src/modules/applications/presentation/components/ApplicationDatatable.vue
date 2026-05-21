<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

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
</script>

<template>
  <DataTable
    :value="items"
    data-key="id"
    :loading="isLoading"
    striped-rows
    paginator
    :rows="10"
    :rows-per-page-options="[10, 20, 50]"
    paginator-template="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
    current-page-report-template="{first} to {last} of {totalRecords}"
    @row-click="onRowClick"
  >
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
