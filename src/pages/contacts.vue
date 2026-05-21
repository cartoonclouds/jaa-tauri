<script setup lang="ts">
  import type { Contact } from "@modules/contacts/domain/entities/Contact";

  import { useContactDatatable } from "@modules/contacts/presentation/composables/useContactDatatable";
  import { contactsSearchPlaceholder } from "@modules/contacts/presentation/constants/contactDatatable";
  import { useContactService } from "@modules/contacts/services/useContactService";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

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
  const form = reactive({ fullName: "", type: "company", email: "" });

  function edit(row: Contact): void {
    editingId.value = row.id;
    form.fullName = row.fullName;
    form.type = row.type;
    form.email = row.email ?? "";
  }

  function resetForm(): void {
    editingId.value = null;
    form.fullName = "";
    form.type = "company";
    form.email = "";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await service.update({
        id: editingId.value,
        fullName: form.fullName,
        type: form.type as Contact["type"],
        email: form.email || null,
      });
    } else {
      await service.create({
        fullName: form.fullName,
        type: form.type as Contact["type"],
        email: form.email || null,
        companyId: null,
        phone: null,
        linkedinUrl: null,
        notes: null,
      });
    }
    await refresh();
    resetForm();
  }

  async function removeContact(id: string): Promise<void> {
    await service.delete(id);
    await refresh();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Contacts</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.fullName" placeholder="Full name" />
      <InputText v-model="form.type" placeholder="Type" />
      <InputText v-model="form.email" placeholder="Email" />
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
      striped-rows
      lazy
      paginator
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
              <i class="pi pi-search" />
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
  </div>
</template>
