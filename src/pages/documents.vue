<script setup lang="ts">
  import type { Document } from "@modules/documents/domain/entities/Document";

  import { documentsSearchPlaceholder } from "@modules/documents/presentation/constants/documentDatatable";
  import { useDocumentService } from "@modules/documents/services/useDocumentService";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";
  import { useServerDatatable } from "@/composables/useServerDatatable";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const service = useDocumentService();
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
  } = useServerDatatable<Document>({
    fetchPage: (query) => service.listPage(query),
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
      await service.update({
        id: editingId.value,
        title: form.title,
        kind: form.kind,
        filePath: form.filePath,
      });
    } else {
      await service.create({
        title: form.title,
        kind: form.kind,
        filePath: form.filePath,
        mimeType: null,
        sizeBytes: null,
        checksum: null,
      });
    }
    await refresh();
    resetForm();
  }

  async function removeDocument(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
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
      @page="onPage"
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

      <Column field="title" header="Title" />
      <Column field="kind" header="Kind" />
      <Column field="filePath" header="Path" />
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
              @click="removeDocument((slotProps.data as Document).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
