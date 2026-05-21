<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import ApplicationDetailsDrawer from "@modules/applications/presentation/components/ApplicationDetailsDrawer.vue";
  import { useApplication } from "@modules/applications/presentation/composables/useApplication";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useApplication();

  const editingId = ref<string | null>(null);
  const isDetailDrawerOpen = ref(false);
  const selectedApplication = ref<Application | null>(null);
  const selectedRowForActions = ref<Application | null>(null);
  const rowActionsMenu = ref<{
    show?: (event: Event) => void;
    toggle: (event: Event) => void;
  } | null>(null);
  const form = reactive({
    title: "",
    status: "saved",
    locationText: "",
    locationLat: "",
    locationLng: "",
  });

  function hydrateForEdit(row: Application): void {
    editingId.value = row.id;
    form.title = row.title;
    form.status = row.status;
    form.locationText = row.locationText ?? "";
    form.locationLat = row.locationLat?.toString() ?? "";
    form.locationLng = row.locationLng?.toString() ?? "";
  }

  function resetForm(): void {
    editingId.value = null;
    form.title = "";
    form.status = "saved";
    form.locationText = "";
    form.locationLat = "";
    form.locationLng = "";
  }

  async function onSubmit(): Promise<void> {
    if (!form.title.trim()) {
      return;
    }

    const locationLat = form.locationLat ? Number(form.locationLat) : null;
    const locationLng = form.locationLng ? Number(form.locationLng) : null;

    if (editingId.value) {
      await update({
        id: editingId.value,
        title: form.title,
        status: form.status,
        locationText: form.locationText || null,
        locationLat,
        locationLng,
      });
    } else {
      await create({
        title: form.title,
        status: form.status,
        locationText: form.locationText || null,
        locationLat,
        locationLng,
      });
    }

    resetForm();
  }

  function openApplicationDetails(row: Application): void {
    selectedApplication.value = row;
    isDetailDrawerOpen.value = true;
  }

  const rowActions = [
    {
      label: "View details",
      iconName: "heroicons:eye",
      command: () => {
        if (!selectedRowForActions.value) {
          return;
        }

        openApplicationDetails(selectedRowForActions.value);
      },
    },
    {
      label: "Edit",
      iconName: "heroicons:pencil-square",
      command: () => {
        if (!selectedRowForActions.value) {
          return;
        }

        hydrateForEdit(selectedRowForActions.value);
      },
    },
    {
      label: "Delete",
      iconName: "heroicons:trash",
      command: () => {
        if (!selectedRowForActions.value) {
          return;
        }

        void remove(selectedRowForActions.value.id);
      },
    },
  ];

  function onRowClick(event: {
    data: Application;
    originalEvent: Event;
  }): void {
    openRowActions(event.originalEvent, event.data);
  }

  function openRowActions(event: Event, row: Application): void {
    selectedRowForActions.value = row;
    if (rowActionsMenu.value?.show) {
      rowActionsMenu.value.show(event);
      return;
    }

    rowActionsMenu.value?.toggle(event);
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Applications</h1>

    <form class="grid gap-3 md:grid-cols-5" @submit.prevent="onSubmit">
      <InputText v-model="form.title" placeholder="Title" />
      <InputText v-model="form.status" placeholder="Status" />
      <InputText v-model="form.locationText" placeholder="Location" />
      <InputText v-model="form.locationLat" placeholder="Lat" />
      <InputText v-model="form.locationLng" placeholder="Lng" />
      <div class="flex gap-2 md:col-span-5">
        <Button
          type="submit"
          :label="editingId ? 'Update' : 'Create'"
          class="h-10 rounded-xl border-0 bg-slate-900 px-5 font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500"
        />
        <Button
          v-if="editingId"
          type="button"
          severity="secondary"
          label="Cancel"
          outlined
          class="h-10 rounded-xl border-slate-300 px-5 font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400"
          @click="resetForm"
        />
      </div>
    </form>

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
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            text
            rounded
            class="h-9 w-9 border border-transparent text-slate-600 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Open row actions"
            @click.stop="openRowActions($event, slotProps.data as Application)"
          >
            <Icon name="heroicons:ellipsis-horizontal" class="h-5 w-5" />
          </Button>
        </template>
      </Column>
    </DataTable>

    <Menu ref="rowActionsMenu" :model="rowActions" popup>
      <template #item="{ item, props }">
        <a
          v-bind="props.action"
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <Icon :name="item.iconName" class="h-4 w-4" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <ApplicationDetailsDrawer
      v-model:visible="isDetailDrawerOpen"
      :application="selectedApplication"
    />
  </div>
</template>
