<script setup lang="ts">
  import type { Document } from "@modules/documents/domain/entities/Document";

  import { useDocumentCrud } from "@modules/documents/presentation/composables/useDocumentCrud";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useDocumentCrud();
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

    <DataTable :value="items" data-key="id" :loading="isLoading" striped-rows>
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
              @click="remove((slotProps.data as Document).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
