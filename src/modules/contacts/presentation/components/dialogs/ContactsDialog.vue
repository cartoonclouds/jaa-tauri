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
  import { useToast } from "primevue/usetoast";
  import { computed, ref, watch } from "vue";

  import LocationMapPreview from "@/components/ui/LocationMapPreview.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

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
  const selectedContact = ref<EditableContact | null>(null);
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

  useBodyScrollLock(dialogVisible);
  useBodyScrollLock(mapDialogVisible);

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
   * Opens the contact editor by contact id when available.
   */
  async function openEditContactDialogById(contactId: string): Promise<void> {
    const contacts = await service.list();
    const contact = contacts.find((entry) => entry.id === contactId);
    if (!contact) {
      return;
    }

    openEditContactDialog(contact);
  }

  /**
   * Handles contact editor submit.
   */
  async function onContactEditorSubmit(
    payload: ContactCreatePayload | ContactUpdatePayload,
  ): Promise<void> {
    isSavingContact.value = true;
    const isEditMode = "id" in payload;

    try {
      if (isEditMode) {
        await service.update(payload);
      } else {
        await service.create(payload);
      }

      await refresh();
      isEditorDialogVisible.value = false;
      selectedContact.value = null;
      toast.add({
        severity: "success",
        summary: "Contact saved",
        detail: isEditMode
          ? "Contact updated successfully."
          : "Contact created successfully.",
        life: 3000,
      });
    } finally {
      isSavingContact.value = false;
    }
  }

  /**
   * Handles remove contact.
   */
  async function removeContact(id: string): Promise<void> {
    await service.delete(id);
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
      if (!visible || typeof initialContactId !== "string") {
        return;
      }

      await openEditContactDialogById(initialContactId);
    },
    { immediate: true },
  );
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Contacts"
    class="w-[95vw]! max-w-6xl"
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
              :title="`Preview for ${(slotProps.data as Contact).fullName}`"
            />
            <Button
              class="mt-2"
              size="small"
              severity="secondary"
              label="View full map"
              @click="openMap(slotProps.data as Contact)"
            />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                size="small"
                label="Edit"
                @click="openEditContactDialog(slotProps.data as Contact)"
              />
              <Button
                size="small"
                severity="danger"
                label="Delete"
                @click="removeContact((slotProps.data as Contact).id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>

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
    </div>
  </Dialog>
</template>
