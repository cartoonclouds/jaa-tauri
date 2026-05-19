<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";

  import { useCompanyCrud } from "@modules/companies/presentation/composables/useCompanyCrud";
  import { reactive, ref } from "vue";

  const { items, isLoading, create, update, remove } = useCompanyCrud();

  const editingId = ref<string | null>(null);
  const form = reactive({
    name: "",
    locationText: "",
    locationLat: "",
    locationLng: "",
  });

  function hydrateForEdit(row: Company): void {
    editingId.value = row.id;
    form.name = row.name;
    form.locationText = row.locationText ?? "";
    form.locationLat = row.locationLat?.toString() ?? "";
    form.locationLng = row.locationLng?.toString() ?? "";
  }

  function resetForm(): void {
    editingId.value = null;
    form.name = "";
    form.locationText = "";
    form.locationLat = "";
    form.locationLng = "";
  }

  async function onSubmit(): Promise<void> {
    if (!form.name.trim()) {
      return;
    }

    const locationLat = form.locationLat ? Number(form.locationLat) : null;
    const locationLng = form.locationLng ? Number(form.locationLng) : null;

    if (editingId.value) {
      await update({
        id: editingId.value,
        name: form.name,
        locationText: form.locationText || null,
        locationLat,
        locationLng,
      });
    } else {
      await create({
        name: form.name,
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
    <h1 class="text-2xl font-semibold">Companies</h1>

    <form class="grid gap-3 md:grid-cols-4" @submit.prevent="onSubmit">
      <InputText v-model="form.name" placeholder="Company name" />
      <InputText v-model="form.locationText" placeholder="Location" />
      <InputText v-model="form.locationLat" placeholder="Lat" />
      <InputText v-model="form.locationLng" placeholder="Lng" />
      <div class="flex gap-2 md:col-span-4">
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
      <Column field="name" header="Name" />
      <Column field="locationText" header="Location" />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="hydrateForEdit(slotProps.data as Company)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Company).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
