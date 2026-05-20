<script setup lang="ts">
  import type { Setting } from "@modules/settings/domain/entities/Setting";

  import { useSettingCrud } from "@modules/settings/presentation/composables/useSettingCrud";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const { items, isLoading, upsert, remove } = useSettingCrud();
  const editingId = ref<string | null>(null);
  const form = reactive({ theme: "system", locale: "en-GB" });

  function edit(row: Setting): void {
    editingId.value = row.id;
    form.theme = row.theme;
    form.locale = row.locale;
  }

  function resetForm(): void {
    editingId.value = null;
    form.theme = "system";
    form.locale = "en-GB";
  }

  async function submit(): Promise<void> {
    await upsert({
      id: editingId.value ?? undefined,
      theme: form.theme as Setting["theme"],
      locale: form.locale,
    });
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Settings</h1>
    <form class="grid gap-3 md:grid-cols-2" @submit.prevent="submit">
      <InputText v-model="form.theme" placeholder="Theme" />
      <InputText v-model="form.locale" placeholder="Locale" />
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
      <Column field="theme" header="Theme" />
      <Column field="locale" header="Locale" />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Setting)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Setting).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
