<script setup lang="ts">
  import type { Document } from "@modules/documents/domain/entities/Document";

  import { useDocument } from "@modules/documents/presentation/composables/useDocument";
  import {
    documentsGlobalFilterFields,
    documentsSearchPlaceholder,
  } from "@modules/documents/presentation/constants/documentDatatable";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";
  import { useDatatable } from "@/composables/useDatatable";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useDocument();
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
    globalFilterFields: documentsGlobalFilterFields,
  });
  const editingId = ref<string | null>(null);
  const form = reactive({ title: "", kind: "resume", filePath: "" });

  function edit(row: Document): void {
    editingId.value = row.id;
    form.title = row.title;
    form.kind = row.kind;
    form.filePath = row.filePath;
  }

  function resetForm(): void {
    editingId.value = null;
    form.title = "";
    form.kind = "resume";
    form.filePath = "";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await update({
        id: editingId.value,
        title: form.title,
        kind: form.kind,
        filePath: form.filePath,
      });
    } else {
      await create({
        title: form.title,
        kind: form.kind,
        filePath: form.filePath,
        mimeType: null,
        sizeBytes: null,
        checksum: null,
      });
    }
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Documents</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.title" placeholder="Title" />
      <InputText v-model="form.kind" placeholder="Kind" />
      <InputText v-model="form.filePath" placeholder="Path" />
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
              :placeholder="documentsSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

      <Column field="title" header="Title" sortable />
      <Column field="kind" header="Kind" sortable />
      <Column field="filePath" header="Path" sortable />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Document)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Document).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
