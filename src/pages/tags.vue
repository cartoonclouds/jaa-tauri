<script setup lang="ts">
  import type { Tag } from "@modules/tags/domain/entities/Tag";

  import { useTag } from "@modules/tags/presentation/composables/useTag";
  import {
    tagsGlobalFilterFields,
    tagsSearchPlaceholder,
  } from "@modules/tags/presentation/constants/tagDatatable";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";
  import { useDatatable } from "@/composables/useDatatable";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useTag();
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
    globalFilterFields: tagsGlobalFilterFields,
  });
  const editingId = ref<string | null>(null);
  const form = reactive({ name: "", color: "" });

  function edit(row: Tag): void {
    editingId.value = row.id;
    form.name = row.name;
    form.color = row.color ?? "";
  }

  function resetForm(): void {
    editingId.value = null;
    form.name = "";
    form.color = "";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await update({
        id: editingId.value,
        name: form.name,
        color: form.color || null,
      });
    } else {
      await create({ name: form.name, color: form.color || null });
    }
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Tags</h1>
    <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submit">
      <InputText v-model="form.name" placeholder="Name" />
      <InputText v-model="form.color" placeholder="Color" />
      <div class="flex gap-2 md:col-span-2">
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
              :placeholder="tagsSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

      <Column field="name" header="Name" sortable />
      <Column field="color" header="Color" sortable />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Tag)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Tag).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
