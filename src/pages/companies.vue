<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";

  import { useCompanyDatatable } from "@modules/companies/presentation/composables/useCompanyDatatable";
  import { companiesSearchPlaceholder } from "@modules/companies/presentation/constants/companyDatatable";
  import { useCompanyService } from "@modules/companies/services/useCompanyService";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const service = useCompanyService();
  const {
    currentPageReportTemplate,
    globalFilter,
    items,
    isLoading,
    onGlobalFilterInput,
    onPage,
    paginatorTemplate,
    refresh,
    rows,
    rowsPerPageOptions,
    totalRecords,
  } = useCompanyDatatable();

  const editingId = ref<string | null>(null);
  const form = reactive({
    name: "",
    locationText: "",
    locationLat: "",
    locationLng: "",
  });

  /**
   * Handles hydrate for edit.
   */
  function hydrateForEdit(row: Company): void {
    editingId.value = row.id;
    form.name = row.name;
    form.locationText = row.locationText ?? "";
    form.locationLat = row.locationLat?.toString() ?? "";
    form.locationLng = row.locationLng?.toString() ?? "";
  }

  /**
   * Handles reset form.
   */
  function resetForm(): void {
    editingId.value = null;
    form.name = "";
    form.locationText = "";
    form.locationLat = "";
    form.locationLng = "";
  }

  /**
   * Handles on submit.
   */
  async function onSubmit(): Promise<void> {
    if (!form.name.trim()) {
      return;
    }

    const locationLat = form.locationLat ? Number(form.locationLat) : null;
    const locationLng = form.locationLng ? Number(form.locationLng) : null;

    if (editingId.value) {
      await service.update({
        id: editingId.value,
        name: form.name,
        locationText: form.locationText || null,
        locationLat,
        locationLng,
      });
    } else {
      await service.create({
        name: form.name,
        locationText: form.locationText || null,
        locationLat,
        locationLng,
      });
    }

    await refresh();
    resetForm();
  }

  /**
   * Handles remove company.
   */
  async function removeCompany(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
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

    <DataTable
      :value="items"
      data-key="id"
      :loading="isLoading"
      show-gridlines
      striped-rows
      lazy
      paginator
      table-style="min-width: 50rem"
      :rows="rows"
      :total-records="totalRecords"
      :rows-per-page-options="rowsPerPageOptions"
      :paginator-template="paginatorTemplate"
      :current-page-report-template="currentPageReportTemplate"
      @page="onPage"
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <Icon name="heroicons:magnifying-glass" class="h-4 w-4" />
            </InputIcon>
            <InputText
              v-model="globalFilter"
              :placeholder="companiesSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

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
              @click="removeCompany((slotProps.data as Company).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>









