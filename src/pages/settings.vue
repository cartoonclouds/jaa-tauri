<script setup lang="ts">
  import type { Setting } from "@modules/settings/domain/entities/Setting";

  import { useSettingDatatable } from "@modules/settings/presentation/composables/useSettingDatatable";
  import { settingsSearchPlaceholder } from "@modules/settings/presentation/constants/settingDatatable";
  import { useSettingService } from "@modules/settings/services/useSettingService";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

  const service = useSettingService();
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
  } = useSettingDatatable();
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
    await service.upsert({
      id: editingId.value ?? undefined,
      theme: form.theme as Setting["theme"],
      locale: form.locale,
    });
    await refresh();
    resetForm();
  }

  async function removeSetting(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
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
              :placeholder="settingsSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
            />
          </IconField>
        </div>
      </template>

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
              @click="removeSetting((slotProps.data as Setting).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
