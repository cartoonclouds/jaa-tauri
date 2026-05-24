<script setup lang="ts">
  import type { Application as ApplicationEntity } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types/presentation";
  import type {
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload,
  } from "@modules/companies";
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";
  import type { ContactEditorSubmitPayload } from "@modules/contacts/presentation/components/ContactEditorModal.vue";
  import type {
    ContactCreatePayload,
    ContactUpdatePayload,
  } from "@modules/contacts/repositories/ContactRepository";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { useApplicationService } from "@modules/applications";
  import ApplicationDatatable from "@modules/applications/presentation/components/ApplicationDatatable.vue";
  import ApplicationDetailsDrawer from "@modules/applications/presentation/components/ApplicationDetailsDrawer.vue";
  import { useApplicationDatatable } from "@modules/applications/presentation/composables/useApplicationDatatable";
  import { createEmptyApplicationFormValues } from "@modules/applications/types/presentation";
  import { useCompany, useCompanyService } from "@modules/companies";
  import CompanyEditorModal from "@modules/companies/presentation/components/CompanyEditorModal.vue";
  import { useContactService } from "@modules/contacts";
  import ContactEditorModal from "@modules/contacts/presentation/components/ContactEditorModal.vue";
  import { useEventService } from "@modules/events";
  import { useTagService } from "@modules/tags";
  import { resolveTagIdsWithPendingTags } from "@modules/tags/utils/pendingTagResolution";
  import { formatDateTimeLocalValue } from "@shared/utils/toDate";
  import { ref } from "vue";

  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  interface ApplicationContactCreatePayload {
    fullName: string;
    type: ContactType;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    notes: string | null;
  }

  const service = useApplicationService();
  const companyService = useCompanyService();
  const contactService = useContactService();
  const eventService = useEventService();
  const tagService = useTagService();
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
  const { items: companyItems, refresh: refreshCompanies } = useCompany();

  const drawerMode = ref<ApplicationDrawerMode>("view");
  const isDrawerOpen = ref(false);
  const isSubmitting = ref(false);
  const isDeleting = ref(false);
  const isCompanyEditorVisible = ref(false);
  const isContactEditorVisible = ref(false);
  const isSavingCompany = ref(false);
  const isSavingContact = ref(false);
  const selectedApplication = ref<ApplicationEntity | null>(null);
  const selectedCompany = ref<Company | null>(null);
  const selectedContact = ref<EditableContact | null>(null);
  const contactRefreshKey = ref(0);
  const initialFormValues = ref<ApplicationFormValues>(
    createEmptyApplicationFormValues(),
  );

  useBodyScrollLock(isDrawerOpen);

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
      eventFlowStatus: application.eventFlowStatus,
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
      tagIds: application.tagIds,
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
    if (!selectedApplication.value) {
      drawerMode.value = "create";
      return;
    }

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
      const resolvedTagIds = await resolveTagIdsWithPendingTags({
        selectedTagIds: payload.tagIds,
        pendingTagNames: payload.pendingTagNames,
        tagService,
      });

      if (drawerMode.value === "edit" && selectedApplication.value) {
        await service.update({
          id: selectedApplication.value.id,
          companyId: payload.companyId,
          title: payload.title,
          /**
           * Handles cancel edit mode.
           */
          status: payload.status,
          eventFlowStatus: payload.eventFlowStatus,
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
          tagIds: resolvedTagIds,
          priority: payload.priority,
          /**
           * Handles on drawer submit.
           */
          isArchived: payload.isArchived,
        });
      } else {
        const createdApplicationId = await service.create({
          companyId: payload.companyId,
          title: payload.title,
          status: payload.status,
          eventFlowStatus: payload.eventFlowStatus,
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
          tagIds: resolvedTagIds,
          priority: payload.priority,
          isArchived: payload.isArchived,
        });

        for (const step of payload.flowSteps ?? []) {
          await eventService.create({
            applicationId: createdApplicationId,
            contactId: null,
            type: step.type,
            title: step.type,
            description: null,
            eventAt: step.eventAt,
          });
        }
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

  /**
   * Handles open company editor for a specific id.
   */
  function openCompanyEditor(companyId: string): void {
    const company = companyItems.value.find((entry) => entry.id === companyId);
    if (!company) {
      return;
    }

    selectedCompany.value = company;
    isCompanyEditorVisible.value = true;
  }

  /**
   * Handles company editor submit.
   */
  async function onCompanyEditorSubmit(
    payload: CompanyCreatePayload | CompanyUpdatePayload,
  ): Promise<void> {
    isSavingCompany.value = true;

    try {
      if ("id" in payload) {
        await companyService.update(payload);
      } else {
        await companyService.create(payload);
      }

      await refreshCompanies();
      isCompanyEditorVisible.value = false;
    } finally {
      isSavingCompany.value = false;
    }
  }

  /**
   * Handles open contact editor.
   */
  function openContactEditor(contact: EditableContact): void {
    selectedContact.value = contact;
    isContactEditorVisible.value = true;
  }

  /**
   * Handles open contact editor by id.
   */
  async function openContactEditorById(contactId: string): Promise<void> {
    const contacts = await contactService.list();
    const contact = contacts.find((entry) => entry.id === contactId);
    if (!contact) {
      return;
    }

    selectedContact.value = {
      id: contact.id,
      fullName: contact.fullName,
      type: contact.type,
      email: contact.email,
      phone: contact.phone,
      linkedinUrl: contact.linkedinUrl,
      locationText: contact.locationText,
      locationLat: contact.locationLat,
      locationLng: contact.locationLng,
      notes: contact.notes,
    };
    isCompanyEditorVisible.value = false;
    isContactEditorVisible.value = true;
  }

  /**
   * Handles open company editor from contact modal table.
   */
  function openCompanyEditorFromContactModal(companyId: string): void {
    isContactEditorVisible.value = false;
    openCompanyEditor(companyId);
  }

  /**
   * Handles link existing contact to current application.
   */
  async function onRequestLinkContact(contactId: string): Promise<void> {
    if (!selectedApplication.value?.id) {
      return;
    }

    await contactService.linkToApplication(
      selectedApplication.value.id,
      contactId,
    );
    contactRefreshKey.value += 1;
  }

  /**
   * Handles remove linked contact from current application.
   */
  async function onRequestUnlinkContact(contactId: string): Promise<void> {
    if (!selectedApplication.value?.id) {
      return;
    }

    await contactService.unlinkFromApplication(
      selectedApplication.value.id,
      contactId,
    );
    contactRefreshKey.value += 1;
  }

  /**
   * Handles create new contact and link it to current application.
   */
  async function onRequestCreateContact(
    payload: ApplicationContactCreatePayload,
  ): Promise<void> {
    if (!selectedApplication.value?.id) {
      return;
    }

    const contactId = await contactService.create({
      companyId: selectedApplication.value.companyId,
      fullName: payload.fullName,
      type: payload.type,
      email: payload.email,
      phone: payload.phone,
      linkedinUrl: payload.linkedinUrl,
      locationText: payload.locationText,
      locationLat: null,
      locationLng: null,
      notes: payload.notes,
      tagIds: [],
    });

    await contactService.linkToApplication(
      selectedApplication.value.id,
      contactId,
    );
    contactRefreshKey.value += 1;
  }

  /**
   * Handles contact editor submit.
   */
  async function onContactEditorSubmit(
    payload: ContactEditorSubmitPayload,
  ): Promise<void> {
    isSavingContact.value = true;

    try {
      if ("id" in payload) {
        await contactService.update(payload as ContactUpdatePayload);
      } else {
        const contactId = await contactService.create(
          payload as ContactCreatePayload,
        );

        if (selectedApplication.value?.id) {
          await contactService.linkToApplication(
            selectedApplication.value.id,
            contactId,
          );
        }
      }

      contactRefreshKey.value += 1;
      isContactEditorVisible.value = false;
    } finally {
      isSavingContact.value = false;
    }
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
      :contact-refresh-key="contactRefreshKey"
      @update:visible="onDrawerVisibilityChange"
      @submit="onDrawerSubmit"
      @request-edit="switchToEditMode"
      @cancel-edit="cancelEditMode"
      @request-delete="onRequestDelete"
      @request-open-company="openCompanyEditor"
      @request-open-contact="openContactEditor"
      @request-create-contact="onRequestCreateContact"
      @request-link-contact="onRequestLinkContact"
      @request-unlink-contact="onRequestUnlinkContact"
    />

    <CompanyEditorModal
      v-model:visible="isCompanyEditorVisible"
      :company="selectedCompany"
      :busy="isSavingCompany"
      @submit="onCompanyEditorSubmit"
      @request-open-contact="openContactEditorById"
    />

    <ContactEditorModal
      v-model:visible="isContactEditorVisible"
      :contact="selectedContact"
      :application-id="selectedApplication?.id ?? null"
      :initial-company-id="selectedApplication?.companyId ?? null"
      :busy="isSavingContact"
      @submit="onContactEditorSubmit"
      @request-open-company="openCompanyEditorFromContactModal"
    />
  </div>
</template>
