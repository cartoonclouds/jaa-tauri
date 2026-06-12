<script setup lang="ts">
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";

  import { ref, watch } from "vue";

  interface ContactCreateFormState {
    fullName: string;
    type: ContactType;
    email: string;
    phone: string;
    linkedinUrl: string;
    locationText: string;
    notes: string;
  }

  interface ContactLinkOption {
    label: string;
    value: string;
    fullName: string;
    type: ContactType;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    locationText: string | null;
    notes: string | null;
  }

  type ContactNameInputValue = ContactLinkOption | string | null;

  interface Props {
    availableContactsError: string | null;
    isLoadingAvailableContacts: boolean;
    unlinkedContactOptions: ContactLinkOption[];
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    submit: [];
  }>();
  const visible = defineModel<boolean>("visible", { required: true });
  const createForm = defineModel<ContactCreateFormState>("createForm", {
    required: true,
  });
  const selectedContactId = defineModel<string | null>("selectedContactId", {
    required: true,
  });
  const contactNameInput = ref<ContactNameInputValue>(
    createForm.value.fullName,
  );
  const filteredContactOptions = ref<ContactLinkOption[]>([]);

  watch(
    () => createForm.value.fullName,
    (fullName) => {
      if (typeof contactNameInput.value === "string") {
        contactNameInput.value = fullName;
      }
    },
  );

  watch(
    () => props.unlinkedContactOptions,
    (options) => {
      filteredContactOptions.value = options;
    },
    { immediate: true },
  );

  watch(
    () => contactNameInput.value,
    (value) => {
      if (typeof value === "string") {
        createForm.value.fullName = value;
        selectedContactId.value = null;
        return;
      }

      if (!value) {
        createForm.value.fullName = "";
        selectedContactId.value = null;
        return;
      }

      selectedContactId.value = value.value;
      createForm.value = {
        fullName: value.fullName,
        type: value.type,
        email: value.email ?? "",
        phone: value.phone ?? "",
        linkedinUrl: value.linkedinUrl ?? "",
        locationText: value.locationText ?? "",
        notes: value.notes ?? "",
      };
    },
  );

  function searchContacts(event: { query: string }): void {
    const query = event.query.trim().toLowerCase();
    if (!query) {
      filteredContactOptions.value = props.unlinkedContactOptions;
      return;
    }

    filteredContactOptions.value = props.unlinkedContactOptions.filter(
      (option) =>
        option.fullName.toLowerCase().includes(query) ||
        option.label.toLowerCase().includes(query),
    );
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :block-scroll="true"
    :draggable="true"
    header="Add Contact"
    class="w-full max-w-lg"
  >
    <div class="space-y-3">
      <Message v-if="availableContactsError" severity="warn" size="small">
        {{ availableContactsError }}
      </Message>

      <Message
        v-else-if="isLoadingAvailableContacts"
        severity="info"
        size="small"
      >
        Loading contacts for name suggestions...
      </Message>

      <Message
        v-else-if="unlinkedContactOptions.length === 0"
        severity="info"
        size="small"
      >
        No existing contacts available. Enter details to create a new contact.
      </Message>

      <div class="space-y-2">
        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Name</label>
          <AutoComplete
            v-model="contactNameInput"
            :suggestions="filteredContactOptions"
            option-label="label"
            placeholder="Type a full name or select an existing contact"
            dropdown
            fluid
            @complete="searchContacts"
          >
            <template #option="slotProps">
              <div class="flex items-center justify-between gap-2">
                <span>{{ slotProps.option.label }}</span>
                <Tag :value="slotProps.option.type" severity="secondary" />
              </div>
            </template>
          </AutoComplete>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Type</label>
          <Select
            v-model="createForm.type"
            :options="[
              { label: 'Company', value: 'company' },
              { label: 'Recruiter', value: 'recruiter' },
            ]"
            option-label="label"
            option-value="value"
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Email</label>
          <InputText
            v-model="createForm.email"
            placeholder="name@example.com"
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Phone</label>
          <InputText
            v-model="createForm.phone"
            placeholder="Phone number"
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">LinkedIn</label>
          <InputText
            v-model="createForm.linkedinUrl"
            placeholder="https://linkedin.com/in/..."
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Location</label>
          <InputText
            v-model="createForm.locationText"
            placeholder="Location"
            fluid
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Notes</label>
          <Textarea v-model="createForm.notes" rows="3" auto-resize fluid />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          severity="secondary"
          text
          label="Cancel"
          @click="visible = false"
        />
        <Button
          type="button"
          :label="selectedContactId ? 'Link Contact' : 'Create and Add'"
          :disabled="!createForm.fullName.trim()"
          @click="emit('submit')"
        />
      </div>
    </template>
  </Dialog>
</template>
