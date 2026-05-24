<script setup lang="ts">
  import type {
    ContactCreatePayload,
    ContactUpdatePayload,
  } from "@modules/contacts";
  import type { Contact } from "@modules/contacts/domain/entities/Contact";
  import type { EditableContact } from "@modules/contacts/types/presentation";

  import { useContactService } from "@modules/contacts";
  import ContactEditorModal from "@modules/contacts/presentation/components/modals/ContactEditorModal.vue";
  import { useContactDatatable } from "@modules/contacts/presentation/composables/useContactDatatable";
  import { contactsSearchPlaceholder } from "@modules/contacts/presentation/constants/contactDatatable";
  import { computed, ref } from "vue";

  import LocationMapFull from "@/components/ui/LocationMapFull.vue";
  import LocationMapPreview from "@/components/ui/LocationMapPreview.vue";
  import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

  interface Props {
    visible: boolean;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    "update:visible": [value: boolean];
  }>();

  const service = useContactService();
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
  const isEditorModalVisible = ref(false);
  const isSavingContact = ref(false);
  const mapDialogVisible = ref(false);
  const selectedMapContact = ref<Contact | null>(null);

  const modalVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => {
      emit("update:visible", value);
    },
  });

  useBodyScrollLock(modalVisible);
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
   * Handles opening the create contact modal.
   */
  function openCreateContactModal(): void {
    selectedContact.value = null;
    isEditorModalVisible.value = true;
  }

  /**
   * Handles opening the edit contact modal.
   */
  function openEditContactModal(contact: Contact): void {
    selectedContact.value = toEditableContact(contact);
    isEditorModalVisible.value = true;
  }

  /**
   * Handles contact editor submit.
   */
  async function onContactEditorSubmit(
    payload: ContactCreatePayload | ContactUpdatePayload,
  ): Promise<void> {
    isSavingContact.value = true;

    try {
      if ("id" in payload) {
        await service.update(payload);
      } else {
        await service.create(payload);
      }

      await refresh();
      isEditorModalVisible.value = false;
      selectedContact.value = null;
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
</script>

<template>
  <Dialog
    v-model:visible="modalVisible"
    modal
    header="Contacts"
    class="w-[95vw]! max-w-6xl"
  >
    <div class="space-y-6 p-2 md:p-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold">Contacts</h2>
        <Button type="button" @click="openCreateContactModal">
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
                @click="openEditContactModal(slotProps.data as Contact)"
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

      <Dialog
        v-model:visible="mapDialogVisible"
        modal
        :style="{ width: 'min(64rem, 92vw)' }"
        :header="
          selectedMapContact ? `Map - ${selectedMapContact.fullName}` : 'Map'
        "
        @hide="closeMapDialog"
      >
        <LocationMapFull
          :latitude="selectedMapContact?.locationLat ?? null"
          :longitude="selectedMapContact?.locationLng ?? null"
          :location-text="selectedMapContact?.locationText ?? null"
          :title="
            selectedMapContact
              ? `Map for ${selectedMapContact.fullName}`
              : 'Contact location map'
          "
          height-class="h-[26rem]"
        />
      </Dialog>

      <ContactEditorModal
        v-model:visible="isEditorModalVisible"
        :contact="selectedContact"
        :busy="isSavingContact"
        @submit="onContactEditorSubmit"
      />
    </div>
  </Dialog>
</template>
