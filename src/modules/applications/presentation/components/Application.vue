<script setup lang="ts">
  import type { Application as ApplicationEntity } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import type { Company } from "@modules/companies/domain/entities/Company";

  import ApplicationDatatable from "@modules/applications/presentation/components/ApplicationDatatable.vue";
  import ApplicationDetailsDrawer from "@modules/applications/presentation/components/ApplicationDetailsDrawer.vue";
  import { useApplication } from "@modules/applications/presentation/composables/useApplication";
  import { formatDateTimeLocalValue } from "@modules/applications/presentation/utils/dateTimeLocal";
  import { createEmptyApplicationFormValues } from "@modules/applications/types/presentation";
  import { useCompany } from "@modules/companies/presentation/composables/useCompany";
  import { ref } from "vue";

  const { items, isLoading, create, update, remove } = useApplication();
  const { items: companyItems } = useCompany();

  const drawerMode = ref<ApplicationDrawerMode>("view");
  const isDrawerOpen = ref(false);
  const isSubmitting = ref(false);
  const isDeleting = ref(false);
  const selectedApplication = ref<ApplicationEntity | null>(null);
  const initialFormValues = ref<ApplicationFormValues>(
    createEmptyApplicationFormValues(),
  );

  function toFormValues(
    application: ApplicationEntity | null,
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
      attendanceType: application.attendanceType,
      employmentType: application.employmentType,
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

  function openCreateDrawer(): void {
    selectedApplication.value = null;
    initialFormValues.value = toFormValues(null);
    drawerMode.value = "create";
    isDrawerOpen.value = true;
  }

  function openViewDrawer(application: ApplicationEntity): void {
    selectedApplication.value = application;
    initialFormValues.value = toFormValues(application);
    drawerMode.value = "view";
    isDrawerOpen.value = true;
  }

  function switchToEditMode(): void {
    if (!selectedApplication.value) {
      return;
    }

    initialFormValues.value = toFormValues(selectedApplication.value);
    drawerMode.value = "edit";
  }

  function cancelEditMode(): void {
    if (!selectedApplication.value) {
      drawerMode.value = "create";
      return;
    }

    drawerMode.value = "view";
  }

  async function onDrawerSubmit(
    payload: ApplicationFormSubmitPayload,
  ): Promise<void> {
    isSubmitting.value = true;

    try {
      if (drawerMode.value === "edit" && selectedApplication.value) {
        await update({
          id: selectedApplication.value.id,
          companyId: payload.companyId,
          title: payload.title,
          status: payload.status,
          sourceUrl: payload.sourceUrl,
          appliedAt: payload.appliedAt,
          locationText: payload.locationText,
          locationLat: payload.locationLat,
          locationLng: payload.locationLng,
          attendanceType: payload.attendanceType,
          employmentType: payload.employmentType,
          salaryMin: payload.salaryMin,
          salaryMax: payload.salaryMax,
          currency: payload.currency,
          description: payload.description,
          interviewProcess: payload.interviewProcess,
          benefits: payload.benefits,
          priority: payload.priority,
          isArchived: payload.isArchived,
        });
      } else {
        await create({
          companyId: payload.companyId,
          title: payload.title,
          status: payload.status,
          sourceUrl: payload.sourceUrl,
          appliedAt: payload.appliedAt,
          locationText: payload.locationText,
          locationLat: payload.locationLat,
          locationLng: payload.locationLng,
          attendanceType: payload.attendanceType,
          employmentType: payload.employmentType,
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
    } finally {
      isSubmitting.value = false;
    }
  }

  async function onRequestDelete(id: string): Promise<void> {
    isDeleting.value = true;

    try {
      await remove(id);
      isDrawerOpen.value = false;
      drawerMode.value = "view";
      selectedApplication.value = null;
    } finally {
      isDeleting.value = false;
    }
  }

  function onDrawerVisibilityChange(visible: boolean): void {
    isDrawerOpen.value = visible;
    if (visible) {
      return;
    }

    drawerMode.value = "view";
    selectedApplication.value = null;
  }

  function onRowClick(application: ApplicationEntity): void {
    openViewDrawer(application);
  }

  function openDetailsFromButton(row: ApplicationEntity): void {
    openViewDrawer(row);
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Applications</h1>
      <Button
        type="button"
        label="New application"
        icon="pi pi-plus"
        @click="openCreateDrawer"
      />
    </div>

    <ApplicationDatatable
      :items="items"
      :is-loading="isLoading"
      @row-click="onRowClick"
      @open-details="openDetailsFromButton"
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
