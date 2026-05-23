<script setup lang="ts">
  import type { Application as ApplicationEntity } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import { useApplicationService } from "@modules/applications";
  import ApplicationDatatable from "@modules/applications/presentation/components/ApplicationDatatable.vue";
  import ApplicationDetailsDrawer from "@modules/applications/presentation/components/ApplicationDetailsDrawer.vue";
  import { useApplicationDatatable } from "@modules/applications/presentation/composables/useApplicationDatatable";
  import { createEmptyApplicationFormValues } from "@modules/applications/types/presentation";
  import { useCompany } from "@modules/companies/presentation/composables/useCompany";
  import { formatDateTimeLocalValue } from "@shared/utils/toDate";
  import { ref } from "vue";

  const service = useApplicationService();
  const {
    currentPageReportTemplate,
    globalFilter,
    items,
    isLoading,
    onGlobalFilterInput,
    onPage,
    onSearchFieldsChange,
    onSort,
    paginatorTemplate,
    refresh,
    rows,
    rowsPerPageOptions,
    searchFieldOptions,
    searchFields,
    sortField,
    sortOrder,
    totalRecords,
  } = useApplicationDatatable();
  const { items: companyItems } = useCompany();

  const drawerMode = ref<ApplicationDrawerMode>("view");
  const isDrawerOpen = ref(false);
  const isSubmitting = ref(false);
  const isDeleting = ref(false);
  const selectedApplication = ref<ApplicationEntity | null>(null);
  const initialFormValues = ref<ApplicationFormValues>(
    createEmptyApplicationFormValues(),
  );

  /**
   * Handles to form values.
   */
  function toFormValues(
    application: ApplicationEntity | null,
    /**
     * Handles to form values.
     */
  ): ApplicationFormValues {
    if (!application) {
      return createEmptyApplicationFormValues();
    }

    return {
      companyId: application.companyId,
      title: application.title,
      status: application.status,
      sourceUrl: application.sourceUrl ?? "",
      appliedAt: formatDateTimeLocalValue(application.appliedAt),
      locationText: application.locationText ?? "",
      locationLat: application.locationLat,
      locationLng: application.locationLng,
      attendanceType: application.attendanceType ?? null,
      employmentType: application.employmentType ?? null,
      salaryMin: application.salaryMin,
      salaryMax: application.salaryMax,
      currency: application.currency ?? "",
      description: application.description ?? "",
      interviewProcess: application.interviewProcess ?? "",
      benefits: application.benefits ?? "",
      priority: application.priority,
      isArchived: application.isArchived,
    };
  }

  /**
   * Handles open create drawer.
   */
  function openCreateDrawer(): void {
    selectedApplication.value = null;
    initialFormValues.value = toFormValues(null);
    drawerMode.value = "create";
    isDrawerOpen.value = true;
  }

  /**
   * Handles open view drawer.
   */
  function openViewDrawer(application: ApplicationEntity): void {
    /**
     * Handles open create drawer.
     */
    selectedApplication.value = application;
    initialFormValues.value = toFormValues(application);
    drawerMode.value = "view";
    isDrawerOpen.value = true;
  }

  /**
   * Handles switch to edit mode.
   */
  function switchToEditMode(): void {
    if (!selectedApplication.value) {
      return;
    }

    initialFormValues.value = toFormValues(selectedApplication.value);
    drawerMode.value = "edit";
    /**
     * Handles open view drawer.
     */
  }

  /**
   * Handles cancel edit mode.
   */
  function cancelEditMode(): void {
    /**
     * Checks whether cel edit mode is true.
     */
    /**
     * Checks whether cel edit mode is true.
     */
    if (!selectedApplication.value) {
      drawerMode.value = "create";
      return;
    }

    /**

 * Handles switch to edit mode.

 */

    drawerMode.value = "view";
  }

  /**
   * Handles on drawer submit.
   */
  async function onDrawerSubmit(
    payload: ApplicationFormSubmitPayload,
  ): Promise<void> {
    isSubmitting.value = true;

    try {
      if (drawerMode.value === "edit" && selectedApplication.value) {
        await service.update({
          id: selectedApplication.value.id,
          companyId: payload.companyId,
          title: payload.title,
          /**
           * Handles cancel edit mode.
           */
          status: payload.status,
          sourceUrl: payload.sourceUrl,
          appliedAt: payload.appliedAt,
          locationText: payload.locationText,
          locationLat: payload.locationLat,
          locationLng: payload.locationLng,
          attendanceType: payload.attendanceType ?? null,
          employmentType: payload.employmentType ?? null,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          currency: payload.currency,
          description: payload.description,
          interviewProcess: payload.interviewProcess,
          benefits: payload.benefits,
          priority: payload.priority,
          /**
           * Handles on drawer submit.
           */
          isArchived: payload.isArchived,
        });
      } else {
        await service.create({
          companyId: payload.companyId,
          title: payload.title,
          status: payload.status,
          sourceUrl: payload.sourceUrl,
          appliedAt: payload.appliedAt,
          locationText: payload.locationText,
          locationLat: payload.locationLat,
          locationLng: payload.locationLng,
          attendanceType: payload.attendanceType ?? null,
          employmentType: payload.employmentType ?? null,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          currency: payload.currency,
          description: payload.description,
          interviewProcess: payload.interviewProcess,
          benefits: payload.benefits,
          priority: payload.priority,
          isArchived: payload.isArchived,
        });
      }

      isDrawerOpen.value = false;
      drawerMode.value = "view";
      selectedApplication.value = null;
      await refresh();
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Handles on request delete.
   */
  async function onRequestDelete(id: string): Promise<void> {
    isDeleting.value = true;

    try {
      await service.delete(id);
      isDrawerOpen.value = false;
      drawerMode.value = "view";
      selectedApplication.value = null;
      await refresh();
    } finally {
      isDeleting.value = false;
    }
  }

  /**
   * Handles on drawer visibility change.
   */
  function onDrawerVisibilityChange(visible: boolean): void {
    isDrawerOpen.value = visible;
    if (visible) {
      return;
    }

    drawerMode.value = "view";
    selectedApplication.value = null;
  }

  /**
   * Handles on row click.
   */
  function onRowClick(application: ApplicationEntity): void {
    openViewDrawer(application);
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-2xl font-semibold">Applications</h2>
      <Button type="button" @click="openCreateDrawer">
        <Icon name="heroicons:plus" class="h-4 w-4" />
        <span>New Application</span>
      </Button>
    </div>

    <ApplicationDatatable
      :items="items"
      :is-loading="isLoading"
      :global-filter="globalFilter"
      :search-fields="searchFields"
      :search-field-options="searchFieldOptions"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :paginator-template="paginatorTemplate"
      :current-page-report-template="currentPageReportTemplate"
      :total-records="totalRecords"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @update:global-filter="onGlobalFilterInput"
      @update:search-fields="onSearchFieldsChange"
      @page="onPage"
      @sort="onSort"
      @row-click="onRowClick"
    />

    <ApplicationDetailsDrawer
      v-model:visible="isDrawerOpen"
      :mode="drawerMode"
      :application="selectedApplication"
      :initial-values="initialFormValues"
      :companies="companyItems as Company[]"
      :busy="isSubmitting"
      :is-deleting="isDeleting"
      @update:visible="onDrawerVisibilityChange"
      @submit="onDrawerSubmit"
      @request-edit="switchToEditMode"
      @cancel-edit="cancelEditMode"
      @request-delete="onRequestDelete"
    />
  </div>
</template>
