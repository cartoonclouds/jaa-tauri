<script setup lang="ts">
  import type {
    CompanyCreatePayload,
    CompanyUpdatePayload,
  } from "@modules/companies";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import { useCompany } from "@modules/companies";
  import { useCompanyDatatable } from "@modules/companies/composables/useCompanyDatatable";
  import { companiesSearchPlaceholder } from "@modules/companies/constants";
  import CompanyEditorDialog from "@modules/companies/presentation/components/dialogs/CompanyEditorDialog.vue";
  import { useToast } from "primevue/usetoast";
  import { computed, ref, watch } from "vue";

  interface Props {
    visible: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const { service } = useCompany();
  const toast = useToast();
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
  const isEditorDialogVisible = ref(false);
  const isSavingCompany = ref(false);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  watch(dialogVisible, (visible, previousVisible) => {
    if (!visible || previousVisible) {
      return;
    }

    isEditorDialogVisible.value = false;
    selectedCompany.value = null;
  });

  /**
   * Handles open create company dialog.
   */
  function openCreateCompanyDialog(): void {
    selectedCompany.value = null;
    isEditorDialogVisible.value = true;
  }

  /**
   * Handles open edit company dialog.
   */
  function openEditCompanyDialog(company: Company): void {
    selectedCompany.value = company;
    isEditorDialogVisible.value = true;
  }

  /**
   * Handles company editor submit.
   */
  async function onCompanyEditorSubmit(
    payload: CompanyCreatePayload | CompanyUpdatePayload,
  ): Promise<void> {
    isSavingCompany.value = true;
    const isEditMode = "id" in payload;

    try {
      if (isEditMode) {
        await service.update(payload);
      } else {
        await service.create(payload);
      }

      await refresh();
      isEditorDialogVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Company saved",
        detail: isEditMode
          ? "Company updated successfully."
          : "Company created successfully.",
        life: 3000,
      });
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
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :block-scroll="true"
    :draggable="true"
    header="Companies"
    class="w-[95vw] max-w-6xl"
  >
    <div class="space-y-6 p-2 md:p-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">Companies</h2>
        <Button type="button" @click="openCreateCompanyDialog">
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>New Company</span>
        </Button>
      </div>

      <DataTable
        :value="items"
        data-key="id"
        :loading="isLoading"
        show-gridlines
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
                @update:model-value="
                  (value) => onGlobalFilterInput(value ?? '')
                "
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
                @click="openEditCompanyDialog(slotProps.data as Company)"
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

      <CompanyEditorDialog
        v-model:visible="isEditorDialogVisible"
        :company="selectedCompany"
        :busy="isSavingCompany"
        @submit="onCompanyEditorSubmit"
      />
    </div>
  </Dialog>
</template>
