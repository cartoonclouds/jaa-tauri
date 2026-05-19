<script setup lang="ts">
  import type { Event } from "@modules/events/domain/entities/Event";

  import { useEventCrud } from "@modules/events/presentation/composables/useEventCrud";
  import { reactive, ref } from "vue";

  const { items, isLoading, create, update, remove } = useEventCrud();
  const editingId = ref<string | null>(null);
  const form = reactive({ applicationId: "", type: "note", title: "" });

  function edit(row: Event): void {
    editingId.value = row.id;
    form.applicationId = row.applicationId;
    form.type = row.type;
    form.title = row.title;
  }

  function resetForm(): void {
    editingId.value = null;
    form.applicationId = "";
    form.type = "note";
    form.title = "";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await update({ id: editingId.value, type: form.type, title: form.title });
    } else {
      await create({
        applicationId: form.applicationId,
        type: form.type,
        title: form.title,
        contactId: null,
        description: null,
        eventAt: null,
      });
    }
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Events</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.applicationId" placeholder="Application ID" />
      <InputText v-model="form.type" placeholder="Type" />
      <InputText v-model="form.title" placeholder="Title" />
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

    <DataTable :value="items" data-key="id" :loading="isLoading" striped-rows>
      <Column field="type" header="Type" />
      <Column field="title" header="Title" />
      <Column field="applicationId" header="Application" />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Event)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Event).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
