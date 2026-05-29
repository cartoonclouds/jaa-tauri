<script setup lang="ts">
  import type { Tag } from "@modules/tags/domain/entities/Tag";

  import { useTag } from "@modules/tags/composables/useTag";
  import { useTagDatatable } from "@modules/tags/composables/useTagDatatable";
  import { tagsSearchPlaceholder } from "@modules/tags/constants";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const { create, update, remove } = useTag();
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
  } = useTagDatatable();
  const editingId = ref<string | null>(null);
  const form = reactive({ name: "", color: "" });

  /**
   * Handles edit.
   */
  function edit(row: Tag): void {
    editingId.value = row.id;
    form.name = row.name;
    form.color = row.color ?? "";
  }

  /**
   * Handles reset form.
   */
  function resetForm(): void {
    editingId.value = null;
    form.name = "";
    form.color = "";
  }

  /**
   * Handles submit.
   */
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
    await refresh();
    resetForm();
  }

  /**
   * Handles remove tag.
   */
  async function removeTag(id: string): Promise<void> {
    await remove(id);
    await refresh();
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
              :placeholder="tagsSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

      <Column field="name" header="Name" />
      <Column field="color" header="Color" />
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
              @click="removeTag((slotProps.data as Tag).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
