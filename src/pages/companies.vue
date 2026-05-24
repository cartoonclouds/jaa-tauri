<script setup lang="ts">
  import type { Company } from "@modules/companies/domain/entities/Company";
  import type { CompanyEditorSubmitPayload } from "@modules/companies/presentation/components/CompanyEditorModal.vue";

  import CompanyEditorModal from "@modules/companies/presentation/components/CompanyEditorModal.vue";
  import { useCompanyDatatable } from "@modules/companies/presentation/composables/useCompanyDatatable";
  import { companiesSearchPlaceholder } from "@modules/companies/presentation/constants/companyDatatable";
  import { useCompanyService } from "@modules/companies/services/useCompanyService";
  import { ref } from "vue";

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
  const selectedCompany = ref<Company | null>(null);
  const isEditorModalVisible = ref(false);
  const isSavingCompany = ref(false);

  /**
   * Handles open create company modal.
   */
  function openCreateCompanyModal(): void {
    selectedCompany.value = null;
    isEditorModalVisible.value = true;
  }

  /**
   * Handles open edit company modal.
   */
  function openEditCompanyModal(company: Company): void {
    selectedCompany.value = company;
    isEditorModalVisible.value = true;
  }

  /**
   * Handles company editor submit.
   */
  async function onCompanyEditorSubmit(
    payload: CompanyEditorSubmitPayload,
  ): Promise<void> {
    isSavingCompany.value = true;

    try {
      if ("id" in payload) {
        await service.update(payload);
      } else {
        await service.create(payload);
      }

      await refresh();
      isEditorModalVisible.value = false;
    } finally {
      isSavingCompany.value = false;
    }
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
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Companies</h1>
      <Button type="button" @click="openCreateCompanyModal">
        <Icon name="heroicons:plus" class="h-4 w-4" />
        <span>New Company</span>
      </Button>
    </div>

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
              @click="openEditCompanyModal(slotProps.data as Company)"
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

    <CompanyEditorModal
      v-model:visible="isEditorModalVisible"
      :company="selectedCompany"
      :busy="isSavingCompany"
      @submit="onCompanyEditorSubmit"
    />
  </div>
</template>
