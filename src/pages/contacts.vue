<script setup lang="ts">
  import type { Contact } from "@modules/contacts/domain/entities/Contact";

  import { useContactDatatable } from "@modules/contacts/presentation/composables/useContactDatatable";
  import { contactsSearchPlaceholder } from "@modules/contacts/presentation/constants/contactDatatable";
  import { useContactService } from "@modules/contacts/services/useContactService";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";
  import LocationMapFull from "@/components/ui/LocationMapFull.vue";
  import LocationMapPreview from "@/components/ui/LocationMapPreview.vue";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  definePageMeta({ ssr: false });

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
  const editingId = ref<string | null>(null);
  const mapDialogVisible = ref(false);
  const selectedMapContact = ref<Contact | null>(null);
  const form = reactive({
    fullName: "",
    type: "company",
    email: "",
    locationText: "",
    locationLat: "",
    locationLng: "",
  });

  /**
   * Handles to nullable number.
   */
  function toNullableNumber(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  /**
   * Handles edit.
   */
  function edit(row: Contact): void {
    editingId.value = row.id;
    form.fullName = row.fullName;
    form.type = row.type;
    form.email = row.email ?? "";
    form.locationText = row.locationText ?? "";
    form.locationLat = row.locationLat === null ? "" : String(row.locationLat);
    form.locationLng = row.locationLng === null ? "" : String(row.locationLng);
  }

  /**
   * Handles reset form.
   */
  function resetForm(): void {
    editingId.value = null;
    form.fullName = "";
    form.type = "company";
    form.email = "";
    form.locationText = "";
    form.locationLat = "";
    form.locationLng = "";
  }

  /**
   * Handles submit.
   */
  async function submit(): Promise<void> {
    if (editingId.value) {
      await service.update({
        id: editingId.value,
        fullName: form.fullName,
        type: form.type as Contact["type"],
        email: form.email || null,
        locationText: form.locationText || null,
        locationLat: toNullableNumber(form.locationLat),
        locationLng: toNullableNumber(form.locationLng),
      });
    } else {
      await service.create({
        fullName: form.fullName,
        type: form.type as Contact["type"],
        email: form.email || null,
        locationText: form.locationText || null,
        locationLat: toNullableNumber(form.locationLat),
        locationLng: toNullableNumber(form.locationLng),
        companyId: null,
        phone: null,
        linkedinUrl: null,
        notes: null,
      });
    }
    await refresh();
    resetForm();
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
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Contacts</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.fullName" placeholder="Full name" />
      <InputText v-model="form.type" placeholder="Type" />
      <InputText v-model="form.email" placeholder="Email" />
      <InputText v-model="form.locationText" placeholder="Location" />
      <InputText v-model="form.locationLat" placeholder="Latitude" />
      <InputText v-model="form.locationLng" placeholder="Longitude" />
      <div class="flex gap-2 md:col-span-3">
        <Button type="submit" :label="editingId ? 'Update' : 'Create'" />
        <Button
          v-if="editingId"
          type="button"
          severity="secondary"
          label="Cancel"
          @click="resetForm"
        />
      </div>
    </form>

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
              :placeholder="contactsSearchPlaceholder"
              @update:model-value="(value) => onGlobalFilterInput(value ?? '')"
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
              @click="edit(slotProps.data as Contact)"
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
  </div>
</template>









