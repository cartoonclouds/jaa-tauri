<script setup lang="ts">
  import type { Tag } from "@modules/tags/domain/entities/Tag";

  import { useTag } from "@modules/tags/presentation/composables/useTag";
  import { definePageMeta } from "nuxt/dist/pages/runtime";
  import { reactive, ref } from "vue";

  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useTag();
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

    <DataTable :value="items" data-key="id" :loading="isLoading" striped-rows>
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
              @click="remove((slotProps.data as Tag).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
