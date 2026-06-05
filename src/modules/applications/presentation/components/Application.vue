<script setup lang="ts">
  import type { Application as ApplicationEntity } from "@modules/applications/domain/entities/Application";
  import type {
    ApplicationDrawerMode,
    ApplicationFormSubmitPayload,
    ApplicationFormValues,
  } from "@modules/applications/types";
  import type {
    Company,
    CompanyCreatePayload,
    CompanyUpdatePayload,
  } from "@modules/companies";
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";
  import type { ContactEditorSubmitPayload } from "@modules/contacts/presentation/components/dialogs/ContactEditorDialog.vue";
  import type {
    ContactCreatePayload,
    ContactUpdatePayload,
  } from "@modules/contacts/repositories/ContactRepository";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { useApplication } from "@modules/applications";
  import { useApplicationDatatable } from "@modules/applications/composables/useApplicationDatatable";
  import ApplicationDatatable from "@modules/applications/presentation/components/ApplicationDatatable.vue";
  import ApplicationDetailsDrawer from "@modules/applications/presentation/components/drawers/ApplicationDetailsDrawer.vue";
  import { createEmptyApplicationFormValues } from "@modules/applications/presentation/utils/createEmptyApplicationFormValues";
  import { useCompany } from "@modules/companies";
  import CompanyEditorDialog from "@modules/companies/presentation/components/dialogs/CompanyEditorDialog.vue";
  import { useContact } from "@modules/contacts";
  import ContactEditorDialog from "@modules/contacts/presentation/components/dialogs/ContactEditorDialog.vue";
  import { useEvent } from "@modules/events";
  import { EVENT_COPY_BY_STAGE } from "@modules/events/constants";
  import { useTag } from "@modules/tags";
  import { resolveTagIdsWithPendingTags } from "@modules/tags/utils/pendingTagResolution";
  import { toErrorMessage } from "@shared/utils/error";
  import { formatDateTimeLocalValue } from "@shared/utils/toDate";
  import { useToast } from "primevue/usetoast";
  import { ref } from "vue";

  import ConfirmActionDialog from "@/components/ui/ConfirmActionDialog.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";
  import { useUnsavedChangesGuard } from "@/composables/useUnsavedChangesGuard";

  interface ApplicationContactCreatePayload {
    fullName: string;
    type: ContactType;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    notes: string | null;
  }

  type DiscardChangesIntent =
    | { type: "close-drawer" }
    | { type: "cancel-edit" };

  const { service } = useApplication();
  const {
    service: companyService,
    items: companyItems,
    refresh: refreshCompanies,
  } = useCompany();
  const { service: contactService } = useContact();
  const { service: eventService } = useEvent();
  const { service: tagService } = useTag();
  const toast = useToast();
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
  const drawerMode = ref<ApplicationDrawerMode>("view");
  const isDrawerOpen = ref(false);
  const isSubmitting = ref(false);
  const isDeleting = ref(false);
  const isCompanyEditorVisible = ref(false);
  const isContactEditorVisible = ref(false);
  const isSavingCompany = ref(false);
  const isSavingContact = ref(false);
  const hasUnsavedDrawerEdits = ref(false);
  const selectedApplication = ref<ApplicationEntity | null>(null);
  const selectedCompany = ref<Company | null>(null);
  const selectedContact = ref<EditableContact | null>(null);
  const contactRefreshKey = ref(0);
  const initialFormValues = ref<ApplicationFormValues>(
    createEmptyApplicationFormValues(),
  );

  const {
    isConfirmVisible: isDiscardChangesConfirmVisible,
    confirmMessage: discardChangesMessage,
    requestConfirmation: requestDiscardChangesConfirmation,
    confirmAndGetIntent,
    cancelConfirmation: onDiscardChangesCancel,
    clearConfirmation,
  } = useUnsavedChangesGuard<DiscardChangesIntent>((intent) => {
    if (intent?.type === "cancel-edit") {
      return "You have unsaved edits in the application form. Cancel edit mode and discard them?";
    }

    return "You have unsaved edits in the application form. Close the drawer and discard them?";
  });

  useBodyScrollLock(isDrawerOpen);

  /**
   * Handles to form values.
   */
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
    hasUnsavedDrawerEdits.value = false;
    drawerMode.value = "create";
    isDrawerOpen.value = true;
  }

  /**
   * Handles open view drawer.
   */
  function openViewDrawer(application: ApplicationEntity): void {
    selectedApplication.value = application;
    initialFormValues.value = toFormValues(application);
    hasUnsavedDrawerEdits.value = false;
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
    hasUnsavedDrawerEdits.value = false;
    drawerMode.value = "edit";
  }

  /**
   * Handles cancel edit mode.
   */
  function cancelEditMode(): void {
    if (hasUnsavedDrawerEdits.value && drawerMode.value === "edit") {
      requestDiscardChangesConfirmation({ type: "cancel-edit" });
      return;
    }

    /**
     * Checks whether cel edit mode is true.
     */
    if (!selectedApplication.value) {
      hasUnsavedDrawerEdits.value = false;
      drawerMode.value = "create";
      return;
    }

    hasUnsavedDrawerEdits.value = false;
    drawerMode.value = "view";
  }

  /**
   * Handles on drawer submit.
   */
  async function onDrawerSubmit(
    payload: ApplicationFormSubmitPayload,
  ): Promise<void> {
    isSubmitting.value = true;
    const isEditMode =
      drawerMode.value === "edit" && selectedApplication.value !== null;
    const editApplicationId = isEditMode
      ? (selectedApplication.value?.id ?? null)
      : null;

    try {
      const resolvedTagIds = await resolveTagIdsWithPendingTags({
        selectedTagIds: payload.tagIds,
        pendingTagNames: payload.pendingTagNames,
        tagService,
      });

      if (isEditMode && selectedApplication.value) {
        await service.update({
          id: selectedApplication.value.id,
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
          tagIds: resolvedTagIds,
          priority: payload.priority,
          isArchived: payload.isArchived,
        });
      } else {
        const createdApplicationId = await service.create({
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
          tagIds: resolvedTagIds,
          priority: payload.priority,
          isArchived: payload.isArchived,
        });

        const createdApplicationEvents = (await eventService.list()).filter(
          (event) => event.applicationId === createdApplicationId,
        );
        const selectedTypes = new Set(
          (payload.flowSteps ?? []).map((step) => step.type),
        );
        const createdEventByType = new Map(
          createdApplicationEvents.map((event) => [event.type, event]),
        );

        for (const defaultEvent of createdApplicationEvents) {
          if (selectedTypes.has(defaultEvent.type)) {
            continue;
          }

          await eventService.delete(defaultEvent.id);
        }

        for (const step of payload.flowSteps ?? []) {
          const stepSortOrder = step.sortOrder;
          const existingEvent = createdEventByType.get(step.type) ?? null;
          if (existingEvent) {
            await eventService.update({
              id: existingEvent.id,
              sortOrder: stepSortOrder,
            });
            continue;
          }

          await eventService.create({
            applicationId: createdApplicationId,
            type: step.type,
            title: EVENT_COPY_BY_STAGE[step.type].title,
            description: null,
            notes: step.notes ?? null,
            sortOrder: stepSortOrder,
          });
        }
      }

      await refresh();
      if (editApplicationId) {
        await refetchSelectedApplication(editApplicationId);
      }

      hasUnsavedDrawerEdits.value = false;

      toast.add({
        severity: "success",
        summary: "Application saved",
        detail: isEditMode
          ? "Application updated successfully."
          : "Application created successfully.",
        life: 3000,
      });
    } catch (error) {
      toast.add({
        severity: "error",
        summary: "Save failed",
        detail: toErrorMessage(error),
        life: 4000,
      });
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

    clearConfirmation();
    hasUnsavedDrawerEdits.value = false;
    drawerMode.value = "view";
    selectedApplication.value = null;
  }

  /**
   * Tracks dirty state changes from the application form tab.
   */
  function onDrawerDirtyChange(value: boolean): void {
    hasUnsavedDrawerEdits.value = value;
  }

  /**
   * Handles drawer close requests and prompts when there are unsaved edits.
   */
  function onDrawerRequestClose(): void {
    if (
      hasUnsavedDrawerEdits.value &&
      (drawerMode.value === "create" || drawerMode.value === "edit")
    ) {
      requestDiscardChangesConfirmation({ type: "close-drawer" });
      return;
    }

    onDrawerVisibilityChange(false);
  }

  /**
   * Discards pending edits and closes the drawer.
   */
  function confirmDiscardAndCloseDrawer(): void {
    const intent = confirmAndGetIntent();
    hasUnsavedDrawerEdits.value = false;

    if (intent?.type === "cancel-edit") {
      if (!selectedApplication.value) {
        drawerMode.value = "create";
        return;
      }

      drawerMode.value = "view";
      return;
    }

    onDrawerVisibilityChange(false);
  }

  /**
   * Handles on row click.
   */
  function onRowClick(application: ApplicationEntity): void {
    openViewDrawer(application);
  }

  /**
   * Refetches a single application and updates the selected value.
   */
  async function refetchSelectedApplication(id: string): Promise<void> {
    const applications = await service.list();
    const refetchedApplication =
      applications.find((entry) => entry.id === id) ?? null;
    selectedApplication.value = refetchedApplication;
    initialFormValues.value = toFormValues(refetchedApplication);
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
   * Handles open company editor from contact dialog table.
   */
  function openCompanyEditorFromContactDialog(companyId: string): void {
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
  <div class="space-y-6">
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
      :has-unsaved-changes="hasUnsavedDrawerEdits"
      @update:visible="onDrawerVisibilityChange"
      @submit="onDrawerSubmit"
      @request-edit="switchToEditMode"
      @request-close="onDrawerRequestClose"
      @cancel-edit="cancelEditMode"
      @dirty-change="onDrawerDirtyChange"
      @request-delete="onRequestDelete"
      @request-open-company="openCompanyEditor"
      @request-open-contact="openContactEditor"
      @request-create-contact="onRequestCreateContact"
      @request-link-contact="onRequestLinkContact"
      @request-unlink-contact="onRequestUnlinkContact"
    />

    <ConfirmActionDialog
      v-model:visible="isDiscardChangesConfirmVisible"
      title="Discard unsaved changes?"
      :message="discardChangesMessage"
      confirm-label="Discard"
      confirm-severity="warn"
      @confirm="confirmDiscardAndCloseDrawer"
      @cancel="onDiscardChangesCancel"
    />

    <CompanyEditorDialog
      v-model:visible="isCompanyEditorVisible"
      :company="selectedCompany"
      :busy="isSavingCompany"
      :show-jobs-applied-for-section="false"
      @submit="onCompanyEditorSubmit"
      @request-open-contact="openContactEditorById"
    />

    <ContactEditorDialog
      v-model:visible="isContactEditorVisible"
      :contact="selectedContact"
      :application-id="selectedApplication?.id ?? null"
      :initial-company-id="selectedApplication?.companyId ?? null"
      :busy="isSavingContact"
      @submit="onContactEditorSubmit"
      @request-open-company="openCompanyEditorFromContactDialog"
    />
  </div>
</template>
