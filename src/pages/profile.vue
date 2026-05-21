<script setup lang="ts">
  import type { Profile } from "@modules/profile/domain/entities/Profile";

  import { useProfile } from "@modules/profile/presentation/composables/useProfile";
  import {
    profileGlobalFilterFields,
    profileSearchPlaceholder,
  } from "@modules/profile/presentation/constants/profileDatatable";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";
  import { useDatatable } from "@/composables/useDatatable";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useProfile();
  const {
    currentPageReportTemplate,
    filters,
    globalFilter,
    globalFilterFields,
    onGlobalFilterInput,
    paginatorTemplate,
    rows,
    rowsPerPageOptions,
  } = useDatatable({
    globalFilterFields: profileGlobalFilterFields,
  });
  const editingId = ref<string | null>(null);
  const form = reactive({ fullName: "", email: "", headline: "" });

  function edit(row: Profile): void {
    editingId.value = row.id;
    form.fullName = row.fullName;
    form.email = row.email ?? "";
    form.headline = row.headline ?? "";
  }

  function resetForm(): void {
    editingId.value = null;
    form.fullName = "";
    form.email = "";
    form.headline = "";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await update({
        id: editingId.value,
        fullName: form.fullName,
        email: form.email || null,
        headline: form.headline || null,
      });
    } else {
      await create({
        fullName: form.fullName,
        email: form.email || null,
        phone: null,
        linkedinUrl: null,
        portfolioUrl: null,
        headline: form.headline || null,
        summary: null,
        locationText: null,
      });
    }
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Profile</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.fullName" placeholder="Full name" />
      <InputText v-model="form.email" placeholder="Email" />
      <InputText v-model="form.headline" placeholder="Headline" />
      <div class="flex gap-2 md:col-span-3">
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
    >
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="globalFilter"
              :placeholder="profileSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

      <Column field="fullName" header="Name" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="headline" header="Headline" sortable />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Profile)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Profile).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
