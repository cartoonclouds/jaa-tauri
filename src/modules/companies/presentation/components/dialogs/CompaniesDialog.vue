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
  import CompanyViewDialog from "@modules/companies/presentation/components/dialogs/CompanyViewDialog.vue";
  import { showEntitySavedToast } from "@shared/utils/toast";
  import { useToast } from "primevue/usetoast";
  import { computed, ref, watch } from "vue";

  import { useApplicationsDrawer } from "@/composables/useApplicationsDrawer";
  import { useContactsDialog } from "@/composables/useContactsDialog";

  interface Props {
    visible: boolean;
    initialCompanyId?: string | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    initialCompanyId: null,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const { service } = useCompany();
  const { openApplicationDrawer } = useApplicationsDrawer();
  const { openContactsDialog } = useContactsDialog();
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
  const selectedViewCompany = ref<Company | null>(null);
  const isViewDialogVisible = ref(false);
  const selectedCompany = ref<Company | null>(null);
  const isEditorDialogVisible = ref(false);
  const isSavingCompany = ref(false);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const isDirectViewMode = computed(() => {
    return (
      typeof props.initialCompanyId === "string" &&
      props.initialCompanyId.trim().length > 0
    );
  });

  const listDialogVisible = computed({
    get: () => dialogVisible.value && !isDirectViewMode.value,
    set: (value: boolean) => {
      if (!value) {
        dialogVisible.value = false;
      }
    },
  });

  // fallow-ignore-next-line code-duplication
  watch(dialogVisible, (visible, previousVisible) => {
    if (!visible || previousVisible) {
      return;
    }

    isViewDialogVisible.value = false;
    selectedViewCompany.value = null;
    isEditorDialogVisible.value = false;
    selectedCompany.value = null;

    if (typeof props.initialCompanyId !== "string") {
      return;
    }

    void openCompanyViewById(props.initialCompanyId);
  });

  watch(
    () => [isViewDialogVisible.value, isEditorDialogVisible.value] as const,
    ([isViewVisible, isEditorVisible]) => {
      if (!isDirectViewMode.value) {
        return;
      }

      if (!isViewVisible && !isEditorVisible && dialogVisible.value) {
        dialogVisible.value = false;
      }
    },
  );

  /**
   * Handles opening the view company dialog.
   */
  function openViewCompanyDialog(company: Company): void {
    selectedViewCompany.value = company;
    isViewDialogVisible.value = true;
  }

  /**
   * Opens a company in view mode by id.
   */
  async function openCompanyViewById(companyId: string): Promise<void> {
    const normalizedCompanyId = companyId.trim();
    if (normalizedCompanyId.length === 0) {
      return;
    }

    const companyFromCurrentPage = items.value.find(
      (entry) => entry.id === normalizedCompanyId,
    );

    if (companyFromCurrentPage) {
      openViewCompanyDialog(companyFromCurrentPage);
      return;
    }

    const allCompanies = await service.list();
    const company = allCompanies.find(
      (entry) => entry.id === normalizedCompanyId,
    );
    if (!company) {
      return;
    }

    openViewCompanyDialog(company);
  }

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

    try {
      const isEditMode = "id" in payload;

      if (isEditMode) {
        await service.update(payload);
      } else {
        await service.create(payload);
      }

      await refresh();
      isEditorDialogVisible.value = false;
      showEntitySavedToast(toast, "Company", isEditMode);
    } finally {
      isSavingCompany.value = false;
    }
  }

  /**
   * Handles remove company.
   */
  async function removeCompany(id: string): Promise<void> {
    await service.delete(id);
    isViewDialogVisible.value = false;
    selectedViewCompany.value = null;
    await refresh();
  }

  function onRequestEditFromViewDialog(company: Company): void {
    isViewDialogVisible.value = false;
    openEditCompanyDialog(company);
  }

  function onRequestOpenContactFromViewDialog(contactId: string): void {
    isViewDialogVisible.value = false;
    dialogVisible.value = false;
    openContactsDialog(contactId);
  }

  function onRequestOpenApplicationFromViewDialog(applicationId: string): void {
    isViewDialogVisible.value = false;
    dialogVisible.value = false;
    openApplicationDrawer(applicationId);
  }
</script>

<template>
  <Dialog
    v-model:visible="listDialogVisible"
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
            <Button
              size="small"
              severity="secondary"
              label="View"
              @click="openViewCompanyDialog(slotProps.data as Company)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>

  <CompanyViewDialog
    v-model:visible="isViewDialogVisible"
    :company="selectedViewCompany"
    :busy="isSavingCompany"
    @request-edit="onRequestEditFromViewDialog"
    @request-delete="removeCompany"
    @request-open-contact="onRequestOpenContactFromViewDialog"
    @request-open-application="onRequestOpenApplicationFromViewDialog"
  />

  <CompanyEditorDialog
    v-model:visible="isEditorDialogVisible"
    :company="selectedCompany"
    :busy="isSavingCompany"
    @submit="onCompanyEditorSubmit"
  />
</template>
