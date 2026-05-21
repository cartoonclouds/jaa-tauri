<script setup lang="ts">
  import type { Notification } from "@modules/notifications/domain/entities/Notification";

  import { useNotification } from "@modules/notifications/presentation/composables/useNotification";
  import { reactive, ref } from "vue";

  import { definePageMeta } from "#imports";

  definePageMeta({ ssr: false });

  const { items, isLoading, create, update, remove } = useNotification();
  const editingId = ref<string | null>(null);
  const form = reactive({ title: "", body: "", severity: "info" });

  function edit(row: Notification): void {
    editingId.value = row.id;
    form.title = row.title;
    form.body = row.body;
    form.severity = row.severity;
  }

  function resetForm(): void {
    editingId.value = null;
    form.title = "";
    form.body = "";
    form.severity = "info";
  }

  async function submit(): Promise<void> {
    if (editingId.value) {
      await update({
        id: editingId.value,
        title: form.title,
        body: form.body,
        severity: form.severity as Notification["severity"],
      });
    } else {
      await create({
        title: form.title,
        body: form.body,
        severity: form.severity as Notification["severity"],
        applicationId: null,
        eventId: null,
        isRead: false,
        scheduledFor: null,
        sentAt: null,
      });
    }
    resetForm();
  }
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-semibold">Notifications</h1>
    <form class="grid gap-3 md:grid-cols-3" @submit.prevent="submit">
      <InputText v-model="form.title" placeholder="Title" />
      <InputText v-model="form.body" placeholder="Body" />
      <InputText v-model="form.severity" placeholder="Severity" />
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
      <Column field="title" header="Title" />
      <Column field="severity" header="Severity" />
      <Column field="isRead" header="Read" />
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              size="small"
              label="Edit"
              @click="edit(slotProps.data as Notification)"
            />
            <Button
              size="small"
              severity="danger"
              label="Delete"
              @click="remove((slotProps.data as Notification).id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
