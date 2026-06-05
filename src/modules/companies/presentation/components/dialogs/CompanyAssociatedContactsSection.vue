<script setup lang="ts">
  import type { CompanyAssociatedContact } from "@modules/companies/repositories/CompanyRepository";

  /**
   * Defines associated contacts section props.
   */
  interface CompanyAssociatedContactsSectionProps {
    isEditMode: boolean;
    associatedContacts: CompanyAssociatedContact[];
    associatedContactsError: string | null;
    isLoadingAssociatedContacts: boolean;
  }

  defineProps<CompanyAssociatedContactsSectionProps>();

  const emit = defineEmits<{
    "request-open-contact": [contactId: string];
  }>();
</script>

<template>
  <div class="space-y-2 border-t border-surface-200 pt-4 md:col-span-2">
    <h4 class="text-sm font-semibold text-surface-900">Associated Contacts</h4>

    <Message v-if="!isEditMode" severity="info" size="small">
      Associated contacts are available after the company is created.
    </Message>

    <Message v-else-if="associatedContactsError" severity="error" size="small">
      {{ associatedContactsError }}
    </Message>

    <Message
      v-else-if="isLoadingAssociatedContacts"
      severity="info"
      size="small"
    >
      Loading associated contacts...
    </Message>

    <Message
      v-else-if="associatedContacts.length === 0"
      severity="info"
      size="small"
    >
      No contacts are associated with this company yet.
    </Message>

    <div v-else class="overflow-x-auto rounded-lg border border-surface-200">
      <table class="min-w-full divide-y divide-surface-200 text-sm">
        <thead class="bg-surface-50 text-left text-surface-600">
          <tr>
            <th class="px-3 py-2 font-medium">Name</th>
            <th class="px-3 py-2 font-medium">Type</th>
            <th class="px-3 py-2 font-medium">Email</th>
            <th class="px-3 py-2 font-medium">Phone</th>
            <th class="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-surface-200 bg-surface-0 text-surface-700"
        >
          <tr v-for="contact in associatedContacts" :key="contact.id">
            <td class="px-3 py-2">{{ contact.fullName }}</td>
            <td class="px-3 py-2 capitalize">{{ contact.type }}</td>
            <td class="px-3 py-2">{{ contact.email || "-" }}</td>
            <td class="px-3 py-2">{{ contact.phone || "-" }}</td>
            <td class="px-3 py-2 text-right">
              <Button
                type="button"
                text
                size="small"
                aria-label="Open contact"
                @click="emit('request-open-contact', contact.id)"
              >
                <Icon
                  name="heroicons:arrow-top-right-on-square"
                  class="h-4 w-4"
                />
                <span>Open</span>
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
