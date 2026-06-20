<script setup lang="ts">
  import type {
    ContactCreatePayload,
    ContactUpdatePayload,
  } from "@modules/contacts";
  import type { Contact } from "@modules/contacts/domain/entities/Contact";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { useContact } from "@modules/contacts";
  import { useContactDatatable } from "@modules/contacts/composables/useContactDatatable";
  import { contactsSearchPlaceholder } from "@modules/contacts/constants";
  import ContactEditorDialog from "@modules/contacts/presentation/components/dialogs/ContactEditorDialog.vue";
  import ContactLocationMapDialog from "@modules/contacts/presentation/components/dialogs/ContactLocationMapDialog.vue";
  import ContactViewDialog from "@modules/contacts/presentation/components/dialogs/ContactViewDialog.vue";
  import { showEntitySavedToast } from "@shared/utils/toast";
  import { useToast } from "primevue/usetoast";
  import { computed, ref, watch } from "vue";

  import LocationMapPreview from "@/components/ui/LocationMapPreview.vue";
  import { useApplicationsDrawer } from "@/composables/useApplicationsDrawer";
  import { useCompaniesDialog } from "@/composables/useCompaniesDialog";

  interface Props {
    visible: boolean;
    initialContactId?: string | null;
  }

  const props = withDefaults(defineProps<Props>(), {
    initialContactId: null,
  });

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const { service } = useContact();
  const { openApplicationDrawer } = useApplicationsDrawer();
  const { openCompaniesDialog } = useCompaniesDialog();
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
  } = useContactDatatable();
  const selectedViewContact = ref<Contact | null>(null);
  const selectedContact = ref<EditableContact | null>(null);
  const isViewDialogVisible = ref(false);
  const isEditorDialogVisible = ref(false);
  const isSavingContact = ref(false);
  const mapDialogVisible = ref(false);
  const selectedMapContact = ref<Contact | null>(null);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  const isDirectViewMode = computed(() => {
    return (
      typeof props.initialContactId === "string" &&
      props.initialContactId.trim().length > 0
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

  watch(dialogVisible, (visible, previousVisible) => {
    if (!visible || previousVisible) {
      return;
    }

    isViewDialogVisible.value = false;
    selectedViewContact.value = null;
    isEditorDialogVisible.value = false;
    selectedContact.value = null;
    mapDialogVisible.value = false;
    selectedMapContact.value = null;
  });

  /**
   * Maps a persisted contact entity to an editable snapshot.
   */
  function toEditableContact(contact: Contact): EditableContact {
    return {
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
  }

  /**
   * Handles opening the view contact dialog.
   */
  function openViewContactDialog(contact: Contact): void {
    selectedViewContact.value = contact;
    isViewDialogVisible.value = true;
  }

  /**
   * Opens the contact view by contact id when available.
   */
  async function openViewContactDialogById(contactId: string): Promise<void> {
    const normalizedContactId = contactId.trim();
    if (normalizedContactId.length === 0) {
      return;
    }

    const contactFromCurrentPage = items.value.find(
      (entry) => entry.id === normalizedContactId,
    );

    if (contactFromCurrentPage) {
      openViewContactDialog(contactFromCurrentPage);
      return;
    }

    const contacts = await service.list();
    const contact = contacts.find((entry) => entry.id === normalizedContactId);
    if (!contact) {
      return;
    }

    openViewContactDialog(contact);
  }

  /**
   * Handles opening the create contact dialog.
   */
  function openCreateContactDialog(): void {
    selectedContact.value = null;
    isEditorDialogVisible.value = true;
  }

  /**
   * Handles opening the edit contact dialog.
   */
  function openEditContactDialog(contact: Contact): void {
    selectedContact.value = toEditableContact(contact);
    isEditorDialogVisible.value = true;
  }

  /**
   * Handles contact editor submit.
   */
  async function onContactEditorSubmit(
    payload: ContactCreatePayload | ContactUpdatePayload,
  ): Promise<void> {
    isSavingContact.value = true;

    try {
      const isEditMode = "id" in payload;

      await (isEditMode ? service.update(payload) : service.create(payload));

      await refresh();
      isEditorDialogVisible.value = false;
      selectedContact.value = null;
      showEntitySavedToast(toast, "Contact", isEditMode);
    } finally {
      isSavingContact.value = false;
    }
  }

  /**
   * Handles remove contact.
   */
  async function removeContact(id: string): Promise<void> {
    await service.delete(id);
    isViewDialogVisible.value = false;
    selectedViewContact.value = null;
    await refresh();
  }

  /**
   * Handles open map.
   */
  function openMap(contact: Contact): void {
    selectedMapContact.value = contact;
    mapDialogVisible.value = true;
  }

  /**
   * Handles close map dialog.
   */
  function closeMapDialog(): void {
    mapDialogVisible.value = false;
    selectedMapContact.value = null;
  }

  watch(
    () => [dialogVisible.value, props.initialContactId] as const,
    async ([visible, initialContactId]) => {
      if (typeof initialContactId !== "string") {
        return;
      }

      if (!visible) {
        return;
      }

      await openViewContactDialogById(initialContactId);
    },
    { immediate: true },
  );

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

  function onRequestEditFromViewDialog(contact: Contact): void {
    isViewDialogVisible.value = false;
    openEditContactDialog(contact);
  }

  function onRequestOpenCompanyFromViewDialog(companyId: string): void {
    isViewDialogVisible.value = false;
    dialogVisible.value = false;
    openCompaniesDialog(companyId);
  }

  function onRequestOpenApplicationFromViewDialog(applicationId: string): void {
    isViewDialogVisible.value = false;
    dialogVisible.value = false;
    openApplicationDrawer(applicationId);
  }

  function getContactMapPreviewTitle(contact?: Contact): string {
    return `Preview for ${contact?.fullName ?? "contact"}`;
  }

  function onContactMapOpen(contact?: Contact): void {
    if (!contact) {
      return;
    }

    openMap(contact);
  }

  function onViewContact(contact?: Contact): void {
    if (!contact) {
      return;
    }

    openViewContactDialog(contact);
  }
</script>

<template>
  <Dialog
    v-model:visible="listDialogVisible"
    modal
    :block-scroll="true"
    :draggable="true"
    header="Contacts"
    class="w-[95vw] max-w-6xl"
  >
    <div class="space-y-6 p-2 md:p-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">Contacts</h2>
        <Button type="button" @click="openCreateContactDialog">
          <Icon name="heroicons:plus" class="h-4 w-4" />
          <span>New Contact</span>
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
                :placeholder="contactsSearchPlaceholder"
                @update:model-value="
                  (value) => onGlobalFilterInput(value ?? '')
                "
              />
            </IconField>
          </div>
        </template>

        <Column field="fullName" header="Name" />
        <Column field="type" header="Type" />
        <Column field="email" header="Email" />
        <Column field="locationText" header="Location" />
        <Column header="Map" style="width: 15rem">
          <template #body="slotProps">
            <LocationMapPreview
              :latitude="(slotProps.data as Contact).locationLat"
              :longitude="(slotProps.data as Contact).locationLng"
              :location-text="(slotProps.data as Contact).locationText"
              :title="
                getContactMapPreviewTitle(slotProps.data as Contact | undefined)
              "
            />
            <Button
              class="mt-2"
              size="small"
              severity="secondary"
              label="View full map"
              @click="onContactMapOpen(slotProps.data as Contact | undefined)"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button
              size="small"
              severity="secondary"
              label="View"
              @click="onViewContact(slotProps.data as Contact | undefined)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </Dialog>

  <ContactViewDialog
    v-model:visible="isViewDialogVisible"
    :contact="selectedViewContact"
    :busy="isSavingContact"
    @request-edit="onRequestEditFromViewDialog"
    @request-delete="removeContact"
    @request-open-company="onRequestOpenCompanyFromViewDialog"
    @request-open-application="onRequestOpenApplicationFromViewDialog"
  />

  <ContactLocationMapDialog
    v-model:visible="mapDialogVisible"
    :contact="selectedMapContact"
    @hide="closeMapDialog"
  />

  <ContactEditorDialog
    v-model:visible="isEditorDialogVisible"
    :contact="selectedContact"
    :busy="isSavingContact"
    @submit="onContactEditorSubmit"
  />
</template>
