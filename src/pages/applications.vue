<script setup lang="ts">
  import type { Application } from "@modules/applications/domain/entities/Application";

  import { useApplication } from "@modules/applications/presentation/composables/useApplication";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useApplication();

  const editingId = ref<string | null>(null);
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
        <Button type="submit" :label="editingId ? 'Update' : 'Create'" />
        <Button
          v-if="editingId"
          type="button"
          severity="secondary"
          label="Cancel"
          @click="resetForm"
        />
      </div>
    </form>

    <DataTable :value="items" data-key="id" :loading="isLoading" striped-rows>
      <Column field="title" header="Title" />
      <Column field="status" header="Status" />
      <Column field="locationText" header="Location" />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="hydrateForEdit(slotProps.data as Application)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Application).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
