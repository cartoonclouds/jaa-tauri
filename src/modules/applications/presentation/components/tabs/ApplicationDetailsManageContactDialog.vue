<script setup lang="ts">
  import type { ContactType } from "@modules/contacts/domain/entities/Contact";

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
    relationType: ContactType;
  }

  interface Props {
    availableContactsError: string | null;
    isLoadingAvailableContacts: boolean;
    unlinkedContactOptions: ContactLinkOption[];
  }

  defineProps<Props>();

  const emit = defineEmits<{
    submit: [];
  }>();
  const visible = defineModel<boolean>("visible", { required: true });
  const contactActionMode = defineModel<"create" | "link">(
    "contactActionMode",
    {
      required: true,
    },
  );
  const createForm = defineModel<ContactCreateFormState>("createForm", {
    required: true,
  });
  const selectedContactId = defineModel<string | null>("selectedContactId", {
    required: true,
  });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Add Contact"
    class="w-full! max-w-lg"
  >
    <div class="space-y-3">
      <div class="flex gap-2">
        <Button
          type="button"
          size="small"
          :text="contactActionMode !== 'create'"
          @click="contactActionMode = 'create'"
        >
          <span>Create New</span>
        </Button>
        <Button
          type="button"
          size="small"
          :text="contactActionMode !== 'link'"
          @click="contactActionMode = 'link'"
        >
          <span>Link Existing</span>
        </Button>
      </div>

      <div v-if="contactActionMode === 'create'" class="space-y-2">
        <div class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Name</label>
          <InputText
            v-model="createForm.fullName"
            placeholder="Full name"
            fluid
          />
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

      <template v-else>
        <Message v-if="availableContactsError" severity="error" size="small">
          {{ availableContactsError }}
        </Message>

        <Message
          v-else-if="isLoadingAvailableContacts"
          severity="info"
          size="small"
        >
          Loading contacts...
        </Message>

        <Message
          v-else-if="unlinkedContactOptions.length === 0"
          severity="info"
          size="small"
        >
          No available contacts to link.
        </Message>

        <div v-else class="space-y-1">
          <label class="text-sm font-medium text-surface-700">Contact</label>
          <Select
            v-model="selectedContactId"
            :options="unlinkedContactOptions"
            option-label="label"
            option-value="value"
            placeholder="Select a contact"
            fluid
          >
            <template #option="slotProps">
              <div class="flex items-center justify-between gap-2">
                <span>{{ slotProps.option.label }}</span>
                <Tag
                  :value="slotProps.option.relationType"
                  severity="secondary"
                />
              </div>
            </template>
          </Select>
        </div>
      </template>
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
          :label="
            contactActionMode === 'create' ? 'Create and Add' : 'Link Contact'
          "
          :disabled="
            contactActionMode === 'create'
              ? !createForm.fullName.trim()
              : !selectedContactId || isLoadingAvailableContacts
          "
          @click="emit('submit')"
        />
      </div>
    </template>
  </Dialog>
</template>
